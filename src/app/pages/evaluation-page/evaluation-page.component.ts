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
import _ from 'lodash';

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
  rulesNames: any;

  showPassed: boolean;
  showFailed: boolean;
  showWarning: boolean;
  showInapplicable: boolean;
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
    this.showRulesResults = {};
    this.expandRules = false;
    this.sidenav_stop_moving = false;
    this.rules = [];
    this.rulesNames = {};

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
    this.rules = _.keys(this.json.modules.evaluation.act.data);
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
    this.json = _.clone(data);
    console.log(this.json);
    const rulesKeys = _.keys(this.json.modules['act-rules'].rules);

    const rulesJSON = [];

    for (const r of rulesKeys) {
      const obj = {
        'code': r,
        'title': this.json.modules['act-rules'].rules[r].name,
        'outcome': this.json.modules['act-rules'].rules[r].metadata.outcome
      };
      rulesJSON.push(obj);
    }
    this.rulesNames = _.orderBy(rulesJSON, [rule => rule['title'].toLowerCase()], ['asc']);
    console.log(this.rulesNames);
    for (const r of this.rulesNames) {
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

          for (let i = 0; i < _.size(elem['children']); i++) {
            if (elem['children'][i]['type'] === 'tag') {

              format(elem['children'][i]);
            }
          }
        };

        /*for (let i = 0 ; i < _.size(dom) ; i++) {
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
    parser.write(_.replace(code, /(\r\n|\n|\r|\t)/gm, ''));
    parser.end();

    return formatter.render(html(parsedCode));
  }

  getOutcome(rule: string): string {
    return this.json.modules['act-rules'].rules[rule].metadata.outcome;
  }

  showRuleCard(rule: string): boolean {
    const outcome = this.getOutcome(rule);
    const levels = new Array<string>();
    const principles = new Array<string>();

    for (const sc of this.json.modules['act-rules'].rules[rule].metadata['success-criteria']) {
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
      if (_.includes(levels, 'A')) {
        show = this.showA;
      }
      if (_.includes(levels, 'AA')) {
        show = this.showAA;
      }
      if (!show && _.includes(levels, 'AAA')) {
        show = this.showAAA;
      }
    }

    if (show) {
      if (_.includes(principles, 'Perceivable')) {
        show = this.showPerceivable;
      }
      if (_.includes(principles, 'Operable')) {
        show = this.showOperable;
      }
      if (_.includes(principles, 'Understandable')) {
        show = this.showUnderstandable;
      }
      if (_.includes(principles, 'Robust')) {
        show = this.showRobust;
      }
    }
    return show;
  }

  orderRuleResult(rule: string): any[] {
    const dataRule = this.json.modules['act-rules'].rules[rule].results;
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
}
