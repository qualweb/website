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
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import clone from 'lodash.clone';
import orderBy from 'lodash.orderby';
import forEach from 'lodash.foreach';
import { Socket } from 'ngx-socket-io';
import Evaluation from './evaluation.object';

import {ResultCodeDialogComponent} from '@dialogs/result-code-dialog/result-code-dialog.component';
import {ModulesService} from '@app/services/modules.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-evaluation-page',
  templateUrl: './evaluation-page.component.html',
  styleUrls: ['./evaluation-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationPageComponent implements OnInit, OnDestroy {

  @ViewChild('summary', {static: true}) summary: ElementRef;
  @ViewChild('filters', {static: true}) filters: ElementRef;
  @ViewChild('report', {static: true}) report: ElementRef;
  // @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;
  @ViewChildren(MatExpansionPanel) viewPanels: QueryList<MatExpansionPanel>;

  paramsSub: Subscription;
  // evaluationSub: Subscription;

  evaluateLoading: boolean;
  error: boolean;

  url: string;
  // earl: any;
  json: any;
  html: string;

  rules: {}[];
  rulesJson: {}[];

  showFilters: boolean;

  showPassed: boolean;
  showFailed: boolean;
  showWarning: boolean;
  showInapplicable: boolean;

  showACT: boolean;
  showHTML: boolean;
  showCSS: boolean;
  //showBP: boolean;

  showPerceivable: boolean;
  showOperable: boolean;
  showUnderstandable: boolean;
  showRobust: boolean;

  showA: boolean;
  showAA: boolean;
  showAAA: boolean;

  showRulesResults: object;

  filterShow: boolean;
  filterPrinciples: boolean;
  filterLevels: boolean;

  modulesToExecute: {};

  currentModule = 'starting';
  data: Evaluation;

  term: any;

  subtitle: string;

  skipLinkPath: string;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private router: Router,
    private readonly socket: Socket,
    private modulesService: ModulesService,
    private translate: TranslateService
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

    this.showRulesResults = {};
    this.rules = [];

    this.filterShow = false;
    this.filterShow = false;
    this.filterPrinciples = false;
    this.filterLevels = false;

    this.skipLinkPath = `${window.location.href}#main`;

    // to remove existent hashes
    /*if(window.location.hash){
      window.location.hash = '';
    }*/
    if(window.location.hash){
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
  }

  ngOnInit(): void {
    this.modulesService.modules.subscribe(modules => this.modulesToExecute = modules);

    this.showACT = this.modulesToExecute['act'];
    this.showHTML = this.modulesToExecute['html'];
    this.showCSS = this.modulesToExecute['css'];
    //this.showBP = this.modulesToExecute['bp'];

    this.paramsSub = this.route.params.subscribe(params => {
      this.url = decodeURIComponent(params.url);
      this.socket.connect();
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

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    // this.navigationEnd.unsubscribe();
    // this.evaluationSub.unsubscribe();
  }

  initializeData(): void {
    this.modulesService.modules.subscribe(modules => this.modulesToExecute = modules);

    this.showACT = this.modulesToExecute['act'];
    this.showHTML = this.modulesToExecute['html'];
    this.showCSS = this.modulesToExecute['css'];
    //this.showBP = this.modulesToExecute['bp'];

    this.paramsSub = this.route.params.subscribe(params => {
      this.url = params.url;
      this.socket.connect();
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

    this.cd.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.showFilters = window.innerWidth > 599;
  }

  private processData(data: any): void {
    this.json = clone(data);
    let rulesOrTechniques, typeString, groupedResults, dataJson;
    let passedRes, failedRes, warningRes, inapplicableRes;
    const showRulesFilter = [];
    const result = [];

    let subtitlePossibilities = [];
    let sub;

    forEach(this.json['modules'], function(value, key) {
      
      sub = key.split('-')[1];
      if(!subtitlePossibilities.includes(sub))
        subtitlePossibilities.push(sub);

      rulesOrTechniques = value['assertions'];
      switch (key) {
        case 'act-rules':
          //rulesOrTechniques = value['rules'];
          typeString = 'ACT Rule';
          break;
        case 'html-techniques':
          //rulesOrTechniques = value['techniques'];
          typeString = 'HTML Technique';
          break;
        case 'css-techniques':
          //rulesOrTechniques = value['techniques'];
          typeString = 'CSS Technique';
          break;
        /*case 'best-practices':
          //rulesOrTechniques = value['best-practices'];
          typeString = 'Best Practice';
          break;*/
      }
      console.log(rulesOrTechniques);
      forEach(rulesOrTechniques, function(val, key) {
        /*/ Extra step in act-rules because theres an element field instead of htmlCode and pointer
        if(typeString === 'ACT Rule' && val['results'].length){
          forEach(val['results'], function(v, k) {
            if(v['elements'].length){
              v['htmlCode'] = v['elements'][0]['htmlCode'];
              v['pointer'] = v['elements'][0]['pointer'];
            }
          });
        }*/
        groupedResults = groupBy(val['results'], res => res['verdict']);
        passedRes = groupedResults.get('passed');
        failedRes = groupedResults.get('failed');
        warningRes = groupedResults.get('warning');
        inapplicableRes = groupedResults.get('inapplicable');
        dataJson = {
          'code': val['code'],
          'name': val['name'],
          'type': typeString,
          'mapping': val['mapping'],
          'description': val['description'],
          'url': typeof val['metadata']['url'] === 'object' ? Object.values(val['metadata']['url']) : val['metadata']['url'],
          'urlType': typeof val['metadata']['url'],
          'outcome': val['metadata']['outcome'],
          'targets': val['metadata']['target'],
          'success-criterias': val['metadata']['success-criteria'],
          'relateds': val['metadata']['related'],
          'results': val['results'],
          'passedResults': passedRes ? passedRes : [],
          'failedResults': failedRes ? failedRes : [],
          'warningResults': warningRes ? warningRes : [],
          'inapplicableResults': inapplicableRes ? inapplicableRes : [],
          'numbers': {
            'nPassed': val['metadata']['passed'],
            'nFailed': val['metadata']['failed'],
            'nWarning': val['metadata']['warning'],
            'nInapplicable': val['metadata']['inapplicable'] ? val['metadata']['inapplicable'] : 0
          }
        };
        result.push(dataJson);
        if (val['outcome'] === 'inapplicable') {
          showRulesFilter[val['code']] = {
            passed: true,
            failed: true,
            warning: true,
            inapplicable: true
          };
        } else {
          showRulesFilter[val['code']] = {
            passed: true,
            failed: true,
            warning: true,
            inapplicable: false
          };
        }
      });
    });
    
    this.prepareSubtitle(subtitlePossibilities);

    this.rulesJson = orderBy(result, [rule => rule['name'].toLowerCase()], ['asc']);
    this.showRulesResults = showRulesFilter;
  }

  openCodeDialog(code: string): void {
    this.dialog.open(ResultCodeDialogComponent, {
      width: '50vw',
      data: code
    });
  }

  expandAllRules(): void {
    this.viewPanels.forEach(p => p.open());
    this.cd.detectChanges();
  }

  closeAllRules(): void {
    this.viewPanels.forEach(p => p.close());
    this.cd.detectChanges();
  }

  showRuleCard(rule: object): boolean {
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
        case 'HTML Technique':
          show = this.showHTML;
          break;
        case 'CSS Technique':
          show = this.showCSS;
          break;
        /*case 'Best Practice':
          show = this.showBP;
          break;*/
      }
    }

    if (show) {
      if (levels.includes('A')) {
        show = this.showA;
      }
      if (levels.includes('AA')) {
        show = this.showAA;
      }
      if (levels.includes('AAA')) {
        show = this.showAAA;
      }
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

  orderRuleResult(dataRule: any): any[] {
    /*let dataRule;
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
    });*/
    const result = [[], [], [], []];
    let counter = 0;
    for (const data of dataRule) {
      if (data['verdict'] === 'passed') {
        result[0].push(data);
        counter++;
      } else if (data['verdict'] === 'failed') {
        result[1].push(data);
        counter++;
      } else if (data['verdict'] === 'warning') {
        result[2].push(data);
        counter++;
      } else if (data['verdict'] === 'inapplicable') {
        result[3].push(data);
        counter++;
      }
    }
    return result;
  }

  trackByIndex(index: number, rule: {}): number {
    return rule['code'];
  }

  noResults(numbers: any): boolean {
    return (Object.values(numbers)).reduce((a: number, b: number) => a + b, 0) === 0;
    // rule: string
    // return this.getNumberResults(rule).reduce((a, b) => a + b, 0) === 0;
  }

  areAllTheSameTypeOfResults(numbers: any): boolean {
    let count = 0;
    for (const results of Object.values(numbers)) {
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

  prepareSubtitle(subPoss: string[]){
    for(let i = 0; i < subPoss.length; i++){
      subPoss[i] = this.translate.instant('EVALUATION_PAGE.summary.'+subPoss[i]);
    }
    let and = this.translate.instant('EVALUATION_PAGE.summary.and');
    if(subPoss.length > 1){
      this.subtitle = subPoss.slice(0, -1).join(', ') + ' ' + and + ' ' + subPoss.slice(-1);
    } else {
      this.subtitle = subPoss[0];
    }
    if(this.translate.currentLang === 'English'){
      this.subtitle = this.translate.instant('EVALUATION_PAGE.summary.tested') + ' ' + this.subtitle;
    } else {
      this.subtitle = this.subtitle + ' ' + this.translate.instant('EVALUATION_PAGE.summary.tested');
    }
  }

}
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
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
