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
  ChangeDetectorRef
} from '@angular/core';
import {MatDialog, MatExpansionPanel, MatMenuTrigger} from '@angular/material';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import formatter from 'html-formatter';
import htmlparser from 'htmlparser2';
import html from 'htmlparser-to-html';
import {clone, keys, orderBy, size, replace, includes, sum} from 'lodash';

import {EvaluateService} from '@evaluation/evaluate.service';
import {ResultCodeDialogComponent} from '@dialogs/result-code-dialog/result-code-dialog.component';

@Component({
  selector: 'app-evaluation-page',
  templateUrl: './evaluation-page.component.html',
  styleUrls: ['./evaluation-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationPageComponent implements OnInit, OnDestroy {

  @ViewChild('summary') summary: ElementRef;
  @ViewChild('filters') filters: ElementRef;
  @ViewChild('report') report: ElementRef;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChildren(MatExpansionPanel) viewPanels: QueryList<MatExpansionPanel>;

  paramsSub: Subscription;
  evaluationSub: Subscription;

  evaluateLoading: boolean;
  error: boolean;

  url: string;
  earl: any;
  json: any;
  html: string;

  rules: Array<string>;
  rulesAndTechniquesNames: any;

  showFilters: boolean;

  showPassed: boolean;
  showFailed: boolean;
  showWarning: boolean;
  showInapplicable: boolean;

  showACT: boolean;
  showHTML: boolean;
  // showCSS: boolean;
  showBP: boolean;

  showPerceivable: boolean;
  showOperable: boolean;
  showUnderstandable: boolean;
  showRobust: boolean;

  showA: boolean;
  showAA: boolean;
  showAAA: boolean;

  sidenav_stop_moving: boolean;
  showRulesResults: object;

  expandRules: boolean;

  filterShow: boolean;
  filterPrinciples: boolean;
  filterLevels: boolean;

  expandedFilters: boolean;
  clickedOutside: boolean;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private evaluate: EvaluateService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    this.evaluateLoading = true;
    this.error = false;

    this.showFilters = true;

    this.showPassed = true;
    this.showFailed = true;
    this.showWarning = true;
    this.showInapplicable = false;

    this.showACT = true;
    this.showHTML = true;
    // this.showCSS = true;
    this.showBP = true;

    this.showPerceivable = true;
    this.showOperable = true;
    this.showUnderstandable = true;
    this.showRobust = true;

    this.showA = true;
    this.showAA = true;
    this.showAAA = true;

    this.showRulesResults = {};
    this.expandRules = false;
    this.sidenav_stop_moving = false;
    this.rules = [];
    this.rulesAndTechniquesNames = {};

    this.filterShow = false;
    this.filterPrinciples = false;
    this.filterLevels = false;

    this.expandedFilters = false;
    this.clickedOutside = false;

    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) {
            element.scrollIntoView(true);
          }
        }
      }
    });

  }

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe(params => {
      this.url = params.url;
      this.evaluationSub = this.evaluate.url(this.url)
        .subscribe(data => {
          if (data) {
            this.processData(data);
          } else {
            this.error = true;
          }

          this.evaluateLoading = false;
          this.cd.detectChanges();
        });
    });

    /*this.earl = JSON.parse(sessionStorage.getItem('earl'));
    this.json = JSON.parse(sessionStorage.getItem('json'));
    this.html = sessionStorage.getItem('postProcessingHTML');
    this.evaluateLoading = false;
    this.rules = keys(this.json.modules.evaluation.act.data);
    this.processData();
    console.log(this.earl);
    console.log(this.json);*/
  }


  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    // this.evaluationSub.unsubscribe();
  }

  @HostListener('document:click', ['$event']) clickout(event) {
    if (this.expandedFilters && !(event.target.id.toString().includes('Filter') ||
      event.target.parentNode.id.toString().includes('Filter'))) {
      this.clickedOutside = true;
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.showFilters = window.innerWidth > 599 ? true : this.showFilters;
  }

  /*@HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event) {
    if (this.expandedFilters) {
      this.expandedFilters = false;
    }
  } */

  /*  @HostListener('window:scroll', ['$event'])
    onScroll(e): void {
      if (!this.evaluateLoading) {
        const footer = document.getElementById('footer');
        const sidenav = document.getElementById('sidenav');

        if (sidenav.getBoundingClientRect()['top'] + 120 >= footer.getBoundingClientRect()['top']) {
          this.sidenav_stop_moving = true;
        } else {
          this.sidenav_stop_moving = false;
        }
      }
    }*/

  private processData(data: any): void {
    this.json = clone(data);
    console.log(this.json);
    const actRulesKeys = keys(this.json.modules['act-rules'].rules);
    const htmlTechniquesKeys = keys(this.json.modules['html-techniques'].techniques);
    // const cssTechniquesKeys = keys(this.json.modules['css-techniques'].techniques);
    const bestPracticesKeys = keys(this.json.modules['best-practices']['best-practices']);

    const rulesAndTechniquesJSON = [];

    for (const r of actRulesKeys) {
      const obj = {
        'code': r,
        'title': this.json.modules['act-rules'].rules[r].name,
        'outcome': this.json.modules['act-rules'].rules[r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }

            for (const r of htmlTechniquesKeys) {
              const obj = {
                'code': r,
                'title': this.json.modules['html-techniques'].techniques[r].name,
                'outcome': this.json.modules['html-techniques'].techniques[r].metadata.outcome
              };
              rulesAndTechniquesJSON.push(obj);
            }

    /*for (const r of cssTechniquesKeys) {
      const obj = {
        'code': r,
        'title': this.json.modules['css-techniques'].techniques[r].name,
        'outcome': this.json.modules['css-techniques'].techniques[r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }*/

    for (const r of bestPracticesKeys) {
      const obj = {
        'code': r,
        'title': this.json.modules['best-practices']['best-practices'][r].name,
        'outcome': this.json.modules['best-practices']['best-practices'][r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }

    this.rulesAndTechniquesNames = orderBy(rulesAndTechniquesJSON, [rule => rule['title'].toLowerCase()], ['asc']);
    // console.log(this.rulesAndTechniquesNames);
    for (const r of this.rulesAndTechniquesNames) {
      this.rules.push(r['code']);
      if (r['outcome'] === 'inapplicable') {
        this.showRulesResults[r['code']] = {
          passed: true,
          failed: true,
          warning: true,
          inapplicable: true
        };
      } else {
        this.showRulesResults[r['code']] = {
          passed: true,
          failed: true,
          warning: true,
          inapplicable: false
        };
      }
    }
  }

  onInViewportChange(inViewport: boolean, section: string): void {
    switch (section) {
      case 'summary':
        if (inViewport) {
          this.summary.nativeElement.classList.add('active');
          this.filters.nativeElement.classList.remove('active');
          this.report.nativeElement.classList.remove('active');
        } else {
          this.report.nativeElement.classList.remove('active');
          this.summary.nativeElement.classList.remove('active');
          this.filters.nativeElement.classList.add('active');
        }
        break;

      case 'filters':
        if (inViewport) {
          this.summary.nativeElement.classList.remove('active');
          this.filters.nativeElement.classList.add('active');
          this.report.nativeElement.classList.remove('active');
        } else {
          this.summary.nativeElement.classList.remove('active');
          this.filters.nativeElement.classList.remove('active');
          this.report.nativeElement.classList.add('active');
        }
        break;

      case 'report':
        if (inViewport) {
          this.summary.nativeElement.classList.remove('active');
          this.filters.nativeElement.classList.remove('active');
          this.report.nativeElement.classList.add('active');
        }
        break;

      default:
        break;
    }
  }

  openCodeDialog(code: string): void {
    this.dialog.open(ResultCodeDialogComponent, {
      width: '50vw',
      data: code
    });
  }

  expandAllRules(): void {
    this.viewPanels.forEach(p => p.open());
  }

  closeAllRules(): void {
    this.viewPanels.forEach(p => p.close());
  }

  formatCode(code: string): string {
    let parsedCode;
    const handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        throw new Error();
      } else {
        const format = elem => {
          delete elem.attribs['computed-style'];
          delete elem.attribs['w-scrollx'];
          delete elem.attribs['w-scrolly'];
          delete elem.attribs['b-right'];
          delete elem.attribs['b-bottom'];

          for (let i = 0; i < size(elem['children']); i++) {
            if (elem['children'][i]['type'] === 'tag') {

              format(elem['children'][i]);
            }
          }
        };

        /*for (let i = 0 ; i < size(dom) ; i++) {
          if (dom[i]['type'] === 'tag') {
            format(dom[i]);
          }
        }*/
        format(dom[0]);
        // console.log(dom);
        parsedCode = dom;
      }
    });

    const parser = new htmlparser.Parser(handler);
    parser.write(replace(code, /(\r\n|\n|\r|\t)/gm, ''));
    parser.end();

    return formatter.render(html(parsedCode));
  }

  showRuleCard(rule: string): boolean {
    const outcome = this.getOutcome(rule);
    const levels = new Array<string>();
    const principles = new Array<string>();

    for (const sc of this.getSuccessCriteria(rule)) {
      levels.push(sc.level);
      principles.push(sc.principle);
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
      switch (this.getType(rule)) {
        case 'act':
          show = this.showACT;
          break;
        case 'html':
          show = this.showHTML;
          break;
        /*case 'css':
          show = this.showCSS;
          break;*/
        case 'bp':
          show = this.showBP;
          break;
      }
    }

    if (show) {
      if (includes(levels, 'A')) {
        show = this.showA;
      }
      if (includes(levels, 'AA')) {
        show = this.showAA;
      }
      if (!show && includes(levels, 'AAA')) {
        show = this.showAAA;
      }
    }

    if (show) {
      if (includes(principles, 'Perceivable')) {
        show = this.showPerceivable;
      }
      if (includes(principles, 'Operable')) {
        show = this.showOperable;
      }
      if (includes(principles, 'Understandable')) {
        show = this.showUnderstandable;
      }
      if (includes(principles, 'Robust')) {
        show = this.showRobust;
      }
    }
    return show;
  }

  orderRuleResult(rule: string): any[] {
    let dataRule;
    switch (this.getType(rule)) {
      case 'act':
        dataRule = this.json.modules['act-rules'].rules[rule].results;
        break;
      case 'html':
        dataRule = this.json.modules['html-techniques'].techniques[rule].results;
        break;
      case 'css':
        dataRule = this.json.modules['css-techniques'].techniques[rule].results;
        break;
      case 'bp':
        dataRule = this.json.modules['best-practices']['best-practices'][rule].results;
        break;
    }

    const ordering = {};
    const sortOrder = ['passed', 'failed', 'warning', 'inapplicable'];
    for (let i = 0; i < sortOrder.length; i++) {
      ordering[sortOrder[i]] = i;
    }
    dataRule.sort(function (a, b) {
      return (ordering[a.verdict] - ordering[b.verdict]);
    });
    return dataRule;
  }

  getType(rule: string): string {
    if (rule.includes('ACT')) {
      return 'act';
    } else if (rule.includes('HTML')) {
      return 'html';
    } else if (rule.includes('CSS')) {
      return 'css';
    } else if (rule.includes('BP')) {
      return 'bp';
    }
  }

  getValue(rule: string, value: string) {
    switch (this.getType(rule)) {
      case 'act':
        return this.json.modules['act-rules'].rules[rule][value];
      case 'html':
        return this.json.modules['html-techniques'].techniques[rule][value];
      case 'css':
        return this.json.modules['css-techniques'].techniques[rule][value];
      case 'bp':
        return this.json.modules['best-practices']['best-practices'][rule][value];
    }
  }

  getOutcome(rule: string): string {
    return this.getValue(rule, 'metadata').outcome;
  }

  getSuccessCriteria(rule: string): any {
    return this.getValue(rule, 'metadata')['success-criteria'];
  }

  getNumberResults(rule: string): number[] {
    const metadata = this.getValue(rule, 'metadata');
    return [metadata['passed'], metadata['failed'], metadata['warning'], metadata['inapplicable']];
  }

  getSumNumberResults(rule: string): number {
    return sum(this.getNumberResults(rule));
  }

  getUrl(rule: string): string {
    return this.getValue(rule, 'metadata').url;
  }

  getTarget(rule: string, type: string) {
    let result = '';
    if (this.getValue(rule, 'metadata').target[type] === undefined) {
      return '';
    } else {
      const elements = this.getValue(rule, 'metadata').target[type];
      if (typeof elements === 'string') {
        return elements;
      } else {
        for (const elem of elements) {
          result += elem;
          result += ', ';
        }
        return result.substring(0, result.length - 2);
      }
    }
  }
}
