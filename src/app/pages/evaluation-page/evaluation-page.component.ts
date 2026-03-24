import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import orderBy from 'lodash.orderby';
import Evaluation from './evaluation.object';

import { ResultCodeDialogComponent } from '../../dialogs/result-code-dialog/result-code-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { EvaluationService } from '../../services/evaluation.service';

type CheckboxFilter = boolean

@Component({
  selector: 'app-evaluation-page',
  templateUrl: './evaluation-page.component.html',
  styleUrls: ['./evaluation-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationPageComponent implements OnInit, OnDestroy {
  @ViewChildren(MatExpansionPanel) viewPanels:
    | QueryList<MatExpansionPanel>
    | undefined;

  paramsSub: Subscription | undefined;
  queryParamsSub: Subscription | undefined;

  evaluateLoading: boolean;
  error: boolean;

  url: string | undefined;
  json: any;
  html: string | undefined;

  rules: {}[];
  rulesJson: {}[] | undefined;

  showFilters: boolean;

  filters: {
    outcome: {
      passed: CheckboxFilter,
      failed: CheckboxFilter,
      warning: CheckboxFilter,
      inapplicable: CheckboxFilter
    },
    type: {
      act: CheckboxFilter,
      wcag: CheckboxFilter
    },
    principle:  {
      perceivable: CheckboxFilter,
      operable: CheckboxFilter,
      understandable: CheckboxFilter,
      robust: CheckboxFilter,
    },
    level: {
      a: CheckboxFilter,
      aa: CheckboxFilter,
      aaa: CheckboxFilter,
      beyond: CheckboxFilter
    },
    [key: string]: {
      [key: string]: any
    }
  };

  showRulesResults: any;

  currentModule = 'starting';
  data: Evaluation | undefined;

  hasActRules = false;
  hasWcagRules = false;

  term: any;

  subtitle: string | undefined;

  skipLinkPath: string;

  possibleResults: string[][];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private readonly evaluation: EvaluationService
  ) {
    this.evaluateLoading = true;
    this.error = false;

    this.showFilters = true;

    const queryParams = this.route.snapshot.queryParams;

    const paramIsChecked = (name: string, options: { default: boolean } = { default: true }) => {
      // Trying to match https://www.w3.org/TR/wai-aria/#aria-checked
      const val = queryParams[name]
      if (val === "checked") return true
      if (val === "unchecked") return false
      return options.default
    }

    this.filters = {
      outcome: {
        passed: paramIsChecked('outcome-passed'),
        failed: paramIsChecked('outcome-failed'),
        warning: paramIsChecked('outcome-warning'),
        inapplicable: paramIsChecked('outcome-inapplicable', { default: false })
      },
      type: {
        act: paramIsChecked('type-act'),
        wcag: paramIsChecked('type-wcag')
      },
      principle: {
        perceivable: paramIsChecked('principle-perceivable'),
        operable: paramIsChecked('principle-operable'),
        understandable: paramIsChecked('principle-understandable'),
        robust: paramIsChecked('principle-robust'),
      },
      level: {
        a: paramIsChecked('level-a'),
        aa: paramIsChecked('level-aa'),
        aaa: paramIsChecked('level-aaa'),
        beyond: paramIsChecked('level-beyond', { default: false })
      }
    };

    this.showRulesResults = {};
    this.rules = [];

    this.skipLinkPath = `${window.location.href}#main`;

    // name, nName, i18n, nameResults
    this.possibleResults = [
      ['passed', 'nPassed', 'show_passed_result', 'passedResults'],
      ['failed', 'nFailed', 'show_failed_result', 'failedResults'],
      ['warning', 'nWarning', 'show_warning_result', 'warningResults'],
      [
        'inapplicable',
        'nInapplicable',
        'show_inapplicable_result',
        'inapplicableResults',
      ],
    ];

    if (window.location.hash) {
      location.hash = '';
      location.reload();
    }
  }

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe((params) => {
      this.url = decodeURIComponent(params.url);

      const options = {
        url: this.url,
        act: this.filters.type.act,
        wcag: this.filters.type.wcag,
      };
      this.evaluation.evaluate(options).subscribe((report) => {
        if (report) {
          this.processData(report);
        } else {
          this.error = true;
        }
        this.evaluateLoading = false;
        this.cd.detectChanges();
      });
    });

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  setQueryParam(group: string, filter: string): void {
    const isChecked = this.filters[group][filter];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [`${group}-${filter}`]: isChecked ? 'checked' : 'unchecked' },
      queryParamsHandling: 'merge'
    });
  }

  private processData(data: any): void {
    this.json = cloneDeep(data);
    let rulesOrTechniques, typeString = '', groupedResults, dataJson;
    let passedRes, failedRes, warningRes, inapplicableRes;
    const showRulesFilter: any[] = [];
    const result: any[] = [];

    let subtitlePossibilities: any[] = [];
    let sub;

    for (const key in this.json['modules'] ?? {}) {
      const value = this.json['modules'][key];
      sub = key.split('-')[1];
      if (!subtitlePossibilities.includes(sub)) subtitlePossibilities.push(sub);

      rulesOrTechniques = value['assertions'];
      switch (key) {
        case 'act-rules':
          //rulesOrTechniques = value['rules'];
          typeString = 'ACT Rule';
          this.hasActRules = true;
          break;
        case 'wcag-techniques':
          //rulesOrTechniques = value['techniques'];
          typeString = 'WCAG Technique';
          this.hasWcagRules = true;
          break;
      }

      for (const key in rulesOrTechniques ?? {}) {
        const val = rulesOrTechniques[key];
        groupedResults = groupBy(val['results'], (res: any) => res['verdict']);
        passedRes = groupedResults.get('passed');
        failedRes = groupedResults.get('failed');
        warningRes = groupedResults.get('warning');
        inapplicableRes = groupedResults.get('inapplicable');
        dataJson = {
          code: val['code'],
          name: val['name'],
          type: typeString,
          mapping: val['mapping'],
          description: val['description'],
          url:
            typeof val['metadata']['url'] === 'object'
              ? Object.values(val['metadata']['url'])
              : val['metadata']['url'],
          urlType: typeof val['metadata']['url'],
          outcome: val['metadata']['outcome'],
          targets: val['metadata']['target'],
          'success-criterias': val['metadata']['success-criteria'],
          relateds: val['metadata']['related'],
          results: val['results'],
          passedResults: passedRes ? passedRes : [],
          failedResults: failedRes ? failedRes : [],
          warningResults: warningRes ? warningRes : [],
          inapplicableResults: inapplicableRes ? inapplicableRes : [],
          numbers: {
            nPassed: val['metadata']['passed'],
            nFailed: val['metadata']['failed'],
            nWarning: val['metadata']['warning'],
            nInapplicable: val['metadata']['inapplicable']
              ? val['metadata']['inapplicable']
              : 0,
          },
        };

        result.push(dataJson);
        if (val['outcome'] === 'inapplicable') {
          showRulesFilter[val['code']] = {
            passed: true,
            failed: true,
            warning: true,
            inapplicable: true,
          };
        } else {
          showRulesFilter[val['code']] = {
            passed: true,
            failed: true,
            warning: true,
            inapplicable: false,
          };
        }
      }
    }

    this.prepareSubtitle(subtitlePossibilities);

    this.rulesJson = orderBy(
      result,
      [(rule) => rule['name'].toLowerCase()],
      ['asc']
    );
    this.showRulesResults = showRulesFilter;
  }

  openCodeDialog(code: string): void {
    this.dialog.open(ResultCodeDialogComponent, {
      width: '50vw',
      data: code,
    });
  }

  expandAllRules(): void {
    this.viewPanels?.forEach((p) => p.open());
    this.cd.detectChanges();
  }

  closeAllRules(): void {
    this.viewPanels?.forEach((p) => p.close());
    this.cd.detectChanges();
  }

  showRuleCard(rule: any): boolean {
    const outcome = rule['outcome'];
    const levels = new Array<string>();
    const principles = new Array<string>();

    const sucessCriterias = rule['success-criterias'];

    if (sucessCriterias !== undefined) {
      for (const sc of sucessCriterias) {
        levels.push(sc.level);
        principles.push(sc.principle);
      }
    }

    let show = true;

    switch (outcome) {
      case 'passed':
        show = this.filters.outcome.passed;
        break;
      case 'failed':
        show = this.filters.outcome.failed;
        break;
      case 'warning':
        show = this.filters.outcome.warning;
        break;
      case 'inapplicable':
        show = this.filters.outcome.inapplicable;
        break;
    }

    if (show) {
      switch (rule['type']) {
        case 'ACT Rule':
          show = this.filters.type.act;
          break;
        case 'WCAG Technique':
          show = this.filters.type.wcag;
          break;
      }
    }

    if (show) {
      if (levels.length === 0) {
        show = this.filters.level.beyond;
      } else {

        show = levels.reduce<boolean>((accumulator, currentLevels) => {
          if (currentLevels.includes('A')) {
            accumulator = accumulator || this.filters.level.a;
          }
          if (currentLevels.includes('AA')) {
            accumulator = accumulator || this.filters.level.aa;
          }
          if (currentLevels.includes('AAA')) {
            accumulator = accumulator || this.filters.level.aaa;
          }
          return accumulator;
        }, false)
      }

    }

    if (show) {
      if (principles.includes('Perceivable')) {
        show = this.filters.principle.perceivable;
      }
      if (principles.includes('Operable')) {
        show = this.filters.principle.operable;
      }
      if (principles.includes('Understandable')) {
        show = this.filters.principle.understandable;
      }
      if (principles.includes('Robust')) {
        show = this.filters.principle.robust;
      }
    }
    return show;
  }

  trackByIndex(index: number, rule: any): number {
    return rule['code'];
  }

  noResults(numbers: any): boolean {
    return (
      Object.values(numbers)
        .map((n) => Number(n))
        .reduce((a: number, b: number) => a + b, 0) === 0
    );
  }

  areAllTheSameTypeOfResults(numbers: any): boolean {
    let count = 0;
    for (const results of Object.values(numbers).map((n) => Number(n))) {
      if (results > 0) {
        count++;
      }
    }
    return count <= 1;
  }

  prepareSubtitle(subPoss: string[]) {
    for (let i = 0; i < subPoss.length; i++) {
      subPoss[i] = this.translate.instant(
        'EVALUATION_PAGE.summary.' + subPoss[i]
      );
    }
    let and = this.translate.instant('EVALUATION_PAGE.summary.and');
    if (subPoss.length > 1) {
      this.subtitle =
        subPoss.slice(0, -1).join(', ') + ' ' + and + ' ' + subPoss.slice(-1);
    } else {
      this.subtitle = subPoss[0];
    }
    if (this.translate.currentLang === 'English') {
      this.subtitle =
        this.translate.instant('EVALUATION_PAGE.summary.tested') +
        ' ' +
        (this.subtitle || "");
    } else {
      this.subtitle =
        (this.subtitle || "") +
        ' ' +
        this.translate.instant('EVALUATION_PAGE.summary.tested');
    }
  }
}
function groupBy(list: any, keyGetter: any): any {
  const map = new Map();
  list.forEach((item: any) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
