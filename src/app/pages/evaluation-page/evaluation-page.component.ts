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
  showBP: boolean;

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

    this.router.events.subscribe(s => {
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
    this.modulesService.modules.subscribe(modules => this.modulesToExecute = modules);

    this.showACT = this.modulesToExecute['act'];
    this.showHTML = this.modulesToExecute['html'];
    this.showCSS = this.modulesToExecute['css'];
    this.showBP = this.modulesToExecute['bp'];

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

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    // this.evaluationSub.unsubscribe();
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
        case 'best-practices':
          //rulesOrTechniques = value['best-practices'];
          typeString = 'Best Practice';
          break;
      }
      forEach(rulesOrTechniques, function(val, key) {
        // Extra step in act-rules because theres an element field instead of htmlCode and pointer
        if(typeString === 'ACT Rule' && val['results'].length){
          forEach(val['results'], function(v, k) {
            if(v['elements'].length){
              v['htmlCode'] = v['elements'][0]['htmlCode'];
              v['pointer'] = v['elements'][0]['pointer'];
            }
          });
        }
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
    // this.groupedResults = this.groupBy(this.rulesJson, rule => rule['outcome']);
    /*const actRulesKeys = this.json.modules['act-rules'] ? Object.keys(this.json.modules['act-rules'].rules) : [];
    const htmlTechniquesKeys = this.json.modules['html-techniques'] ? Object.keys(this.json.modules['html-techniques'].techniques) : [];
    const cssTechniquesKeys = this.json.modules['css-techniques'] ? Object.keys(this.json.modules['css-techniques'].techniques) : [];
    const bestPracticesKeys = this.json.modules['best-practices'] ? Object.keys(this.json.modules['best-practices']['best-practices']) : [];

    const rulesAndTechniquesJSON = [];

    for (const r of actRulesKeys || []) {
      const obj = {
        'code': r,
        'title': this.json.modules['act-rules'].rules[r].name,
        'outcome': this.json.modules['act-rules'].rules[r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }

    for (const r of htmlTechniquesKeys || []) {
      const obj = {
        'code': r,
        'title': this.json.modules['html-techniques'].techniques[r].name,
        'outcome': this.json.modules['html-techniques'].techniques[r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }

    for (const r of cssTechniquesKeys || []) {
      const obj = {
        'code': r,
        'title': this.json.modules['css-techniques'].techniques[r].name,
        'outcome': this.json.modules['css-techniques'].techniques[r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }

    for (const r of bestPracticesKeys || []) {
      const obj = {
        'code': r,
        'title': this.json.modules['best-practices']['best-practices'][r].name,
        'outcome': this.json.modules['best-practices']['best-practices'][r].metadata.outcome
      };
      rulesAndTechniquesJSON.push(obj);
    }

    for (const r of result || []) {
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
    }*/
  }

  /*onInViewportChange(inViewport: boolean, section: string): void {
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
  }*/

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

  /*formatCode(code: string): string {
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
          delete elem.attribs['css'];

          for (let i = 0; i < elem['children'].length; i++) {
            if (elem['children'][i]['type'] === 'tag') {

              format(elem['children'][i]);
            }
          }
        };

        /*for (let i = 0 ; i < size(dom) ; i++) {
          if (dom[i]['type'] === 'tag') {
            format(dom[i]);
          }
        }
        format(dom[0]);
        // console.log(dom[0]);
        parsedCode = dom;
      }
    });

    const parser = new htmlparser.Parser(handler);
    parser.write(code.replace(/(\r\n|\n|\r|\t)/gm, ''));
    parser.end();
    //console.log(html(parsedCode[0]));

    return formatter.render(html(parsedCode[0]));
    return code;
  }*/

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
        case 'Best Practice':
          show = this.showBP;
          break;
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

  /*getType(rule: string): string {
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

  getTypeString(rule: string): string {
    switch (this.getType(rule)) {
      case 'act':
        return 'ACT Rule';
      case 'html':
        return 'HTML Technique';
      case 'css':
        return 'CSS Technique';
      case 'bp':
        return 'Best Practice';
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
    // console.log(rule, [metadata['passed'], metadata['failed'], metadata['warning'], metadata['inapplicable']]);
    return [metadata['passed'], metadata['failed'], metadata['warning'], metadata['inapplicable']];
  }


  getUrl(rule: string): string | string[] {
    if (this.getUrlType(rule) === 'string') {
      return this.getValue(rule, 'metadata').url;
    } else {
      return Object.values(this.getValue(rule, 'metadata').url);
    }
  }
  getUrlType(rule: string): string {
    return typeof this.getValue(rule, 'metadata').url;
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
  */

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
