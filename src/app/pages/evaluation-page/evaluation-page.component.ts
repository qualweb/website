import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener,
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
import { ModulesService } from '../../services/modules.service';
import { TranslateService } from '@ngx-translate/core';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'app-evaluation-page',
  templateUrl: './evaluation-page.component.html',
  styleUrls: ['./evaluation-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationPageComponent implements OnInit, OnDestroy {
  @ViewChild('summary', { static: true }) summary: ElementRef | undefined;
  @ViewChild('filters', { static: true }) filters: ElementRef | undefined;
  @ViewChild('report', { static: true }) report: ElementRef | undefined;
  // @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;
  @ViewChildren(MatExpansionPanel) viewPanels:
    | QueryList<MatExpansionPanel>
    | undefined;

  paramsSub: Subscription | undefined;
  // evaluationSub: Subscription;

  evaluateLoading: boolean;
  error: boolean;

  url: string | undefined;
  // earl: any;
  json: any;
  html: string | undefined;

  rules: {}[];
  rulesJson: {}[] | undefined;

  showFilters: boolean;

  showPassed: boolean;
  showFailed: boolean;
  showWarning: boolean;
  showInapplicable: boolean;

  showACT: boolean;
  showWCAG: boolean;
  //showCSS: boolean;
  //showBP: boolean;

  showPerceivable: boolean;
  showOperable: boolean;
  showUnderstandable: boolean;
  showRobust: boolean;

  showA: boolean;
  showAA: boolean;
  showAAA: boolean;
  showBeyond: boolean;

  showRulesResults: any;

  filterShow: boolean;
  filterPrinciples: boolean;
  filterLevels: boolean;

  modulesToExecute:
    | {
      act: boolean;
      wcag: boolean;
    }
    | undefined;

  currentModule = 'starting';
  data: Evaluation | undefined;

  term: any;

  subtitle: string | undefined;

  skipLinkPath: string;

  possibleResults: string[][];

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private router: Router,
    //private readonly socket: Socket,
    private modulesService: ModulesService,
    private translate: TranslateService,
    private readonly evaluation: EvaluationService
  ) {
    this.evaluateLoading = true;
    this.error = false;

    this.showFilters = true;

    this.showPassed = true;
    this.showFailed = true;
    this.showWarning = true;
    this.showInapplicable = false;

    this.showPerceivable = true;
    this.showOperable = true;
    this.showUnderstandable = true;
    this.showRobust = true;

    this.showA = true;
    this.showAA = true;
    this.showAAA = true;
    this.showBeyond = false;

    this.showRulesResults = {};
    this.rules = [];

    this.filterShow = false;
    this.filterShow = false;
    this.filterPrinciples = false;
    this.filterLevels = false;

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

    // to remove existent hashes
    /*if(window.location.hash){
      window.location.hash = '';
    }*/
    if (window.location.hash) {
      location.hash = '';
      location.reload();
    }

    // slice off the remaining '#' in HTML5:
    /*if (typeof window.history.replaceState == 'function') {
      history.replaceState({}, '', window.location.href.slice(0, -1));
    }*/

    // the following code does not work yet! (thats why we remove hashes - to not trick anyone)
    /*this.navigationEnd = this.router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) {
            element.scrollIntoView(true);
          }
        }
      }
    });*/

    this.showACT = !!this.modulesToExecute?.act;
    this.showWCAG = !!this.modulesToExecute?.wcag;
  }

  ngOnInit(): void {
    this.modulesService.modules.subscribe(
      (modules: any) => (this.modulesToExecute = modules)
    );

    this.showACT = !!this.modulesToExecute?.act;
    this.showWCAG = !!this.modulesToExecute?.wcag;
    //this.showCSS = this.modulesToExecute['css'];
    //this.showBP = this.modulesToExecute['bp'];

    this.paramsSub = this.route.params.subscribe((params) => {
      this.url = decodeURIComponent(params.url);

      const options = {
        url: this.url,
        act: !!this.modulesToExecute?.act,
        wcag: !!this.modulesToExecute?.wcag,
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

      /*this.socket.connect();
      this.socket.emit('evaluate', {url: encodeURIComponent(this.url), modules: this.modulesToExecute});
      this.socket.on('evaluator', data => {
        this.data = new Evaluation(data);
      });
      this.socket.on('moduleStart', (module: any) => {
        this.currentModule = module;
        this.cd.detectChanges();
      });
      this.socket.on('moduleEnd', (report: any) => {
        this.data.addModuleEvaluation(report.module, report.report);
      });
      this.socket.on('prepare-data', () => {
        this.currentModule = 'preparing-data';
        this.processData(this.data.getFinalReport());
        this.cd.detectChanges();
      });
      this.socket.on('evaluationEnd', () => {
        setTimeout(() => {
          this.evaluateLoading = false;
          this.cd.detectChanges();
          this.socket.disconnect();
        }, 100);
      });
      this.socket.on('errorHandle', error => {
        this.error = true;
        this.evaluateLoading = false;
        this.cd.detectChanges();
        this.socket.disconnect();
      });*/
    });

    /*this.earl = JSON.parse(sessionStorage.getItem('earl'));
    this.json = JSON.parse(sessionStorage.getItem('json'));
    this.html = sessionStorage.getItem('postProcessingHTML');
    this.evaluateLoading = false;
    this.rules = keys(this.json.modules.evaluation.act.data);
    this.processData();
    console.log(this.earl);
    console.log(this.json);*/

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
    // this.navigationEnd.unsubscribe();
    // this.evaluationSub.unsubscribe();
  }

  initializeData(): void {
    this.modulesService.modules.subscribe(
      (modules: any) => (this.modulesToExecute = modules)
    );

    this.showACT = !!this.modulesToExecute?.act;
    this.showWCAG = !!this.modulesToExecute?.wcag;
    //this.showCSS = this.modulesToExecute['css'];
    //this.showBP = this.modulesToExecute['bp'];

    this.paramsSub = this.route.params.subscribe((params) => {
      this.url = <string>params.url;
      const options = {
        url: this.url,
        act: !!this.modulesToExecute?.act,
        wcag: !!this.modulesToExecute?.wcag,
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

      /*this.socket.connect();
      this.socket.emit('evaluate', {
        url: encodeURIComponent(this.url),
        modules: this.modulesToExecute,
      });
      this.socket.on('evaluator', (data: any) => {
        this.data = new Evaluation(data);
      });
      this.socket.on('moduleStart', (module: any) => {
        this.currentModule = module;
        this.cd.detectChanges();
      });
      this.socket.on('moduleEnd', (report: any) => {
        this.data.addModuleEvaluation(report.module, report.report);
      });
      this.socket.on('prepare-data', () => {
        this.currentModule = 'preparing-data';
        this.processData(this.data.getFinalReport());
        this.cd.detectChanges();
      });
      this.socket.on('evaluationEnd', () => {
        setTimeout(() => {
          this.evaluateLoading = false;
          this.cd.detectChanges();
          this.socket.disconnect();
        }, 100);
      });
      this.socket.on('errorHandle', (error) => {
        this.error = true;
        this.evaluateLoading = false;
        this.cd.detectChanges();
        this.socket.disconnect();
      });*/
    });

    /*this.earl = JSON.parse(sessionStorage.getItem('earl'));
    this.json = JSON.parse(sessionStorage.getItem('json'));
    this.html = sessionStorage.getItem('postProcessingHTML');
    this.evaluateLoading = false;
    this.rules = keys(this.json.modules.evaluation.act.data);
    this.processData();
    console.log(this.earl);
    console.log(this.json);*/

    this.cd.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.showFilters = window.innerWidth > 599;
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
          break;
        case 'wcag-techniques':
          //rulesOrTechniques = value['techniques'];
          typeString = 'WCAG Technique';
          break;
        /*case 'css-techniques':
          //rulesOrTechniques = value['techniques'];
          typeString = 'CSS Technique';
          break;
        case 'best-practices':
          //rulesOrTechniques = value['best-practices'];
          typeString = 'Best Practice';
          break;*/
      }

      for (const key in rulesOrTechniques ?? {}) {
        const val = rulesOrTechniques[key];
        /*/ Extra step in act-rules because theres an element field instead of htmlCode and pointer
        if(typeString === 'ACT Rule' && val['results'].length){
          forEach(val['results'], function(v, k) {
            if(v['elements'].length){
              v['htmlCode'] = v['elements'][0]['htmlCode'];
              v['pointer'] = v['elements'][0]['pointer'];
            }
          });
        }*/
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
        show = this.showPassed;
        break;
      case 'failed':
        show = this.showFailed;
        break;
      case 'warning':
        show = this.showWarning;
        break;
      case 'inapplicable':
        show = this.showInapplicable;
        break;
    }

    if (show) {
      switch (rule['type']) {
        case 'ACT Rule':
          show = this.showACT;
          break;
        case 'WCAG Technique':
          show = this.showWCAG;
          break;
        /*case 'CSS Technique':
          show = this.showCSS;
          break;
        case 'Best Practice':
          show = this.showBP;
          break;*/
      }
    }

    if (show && levels.length > 0) {
      show = levels.reduce<boolean>((accumulator, currentLevels) => {
        if (currentLevels.includes('A')) {
          accumulator = accumulator || this.showA;
        }
        if (currentLevels.includes('AA')) {
          accumulator = accumulator || this.showAA;
        }
        if (currentLevels.includes('AAA')) {
          accumulator = accumulator || this.showAAA;
        }
        if (!currentLevels.includes('A') && !currentLevels.includes('AA') && !currentLevels.includes('AAA')) {
          accumulator = accumulator || this.showBeyond;
        }

        return accumulator;
      }, false)

    }

    if (show) {
      if (principles.includes('Perceivable')) {
        show = this.showPerceivable;
      }
      if (principles.includes('Operable')) {
        show = this.showOperable;
      }
      if (principles.includes('Understandable')) {
        show = this.showUnderstandable;
      }
      if (principles.includes('Robust')) {
        show = this.showRobust;
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
    // rule: string
    // return this.getNumberResults(rule).reduce((a, b) => a + b, 0) === 0;
  }

  areAllTheSameTypeOfResults(numbers: any): boolean {
    let count = 0;
    for (const results of Object.values(numbers).map((n) => Number(n))) {
      if (results > 0) {
        count++;
      }
    }
    return count <= 1;
    /*
    rule: string
    let count = 0;
    for (const results of this.getNumberResults(rule)) {
      if (results > 0) {
        count++;
      }
    }
    return count <= 1;*/
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
        this.subtitle;
    } else {
      this.subtitle =
        this.subtitle +
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
