import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  translateSub: Subscription;
  routerSub: Subscription;

  selectedLang: string;

  langs: any = {
    //'pt': 'Portuguese',
    en: 'English',
  };

  langCodes: any = {
    English: 'en',
    //'Portuguese': 'pt'
  };

  showGoToTop: boolean;

  isDarkTheme: Observable<boolean>;

  constructor(
    public el: ElementRef,
    private translate: TranslateService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.translate.addLangs(Object.values(this.langs));
    this.translate.setDefaultLang('English');

    const lang = localStorage.getItem('language') || 'English';

    /*if (!lang) {
      const browserLang = translate.getBrowserLang();
      const use = includes(keys(this.langs), browserLang) ? this.langs[browserLang] : 'English';

      this.translate.use(use);
      localStorage.setItem('language', use);
    } else {
      this.translate.use(lang);
    } */

    this.translate.use(lang);
    localStorage.setItem('language', 'English');
    this.selectedLang = this.translate.currentLang;

    this.translateSub = this.translate.onLangChange.subscribe(() => {
      this.updateLanguage();
    });
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        document.getElementById('main-content')?.scrollIntoView();
      }
    });
    this.isDarkTheme = this.themeService.isDarkTheme;

    this.showGoToTop = false;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.translateSub.unsubscribe();
    this.routerSub.unsubscribe();
  }

  /**
   * Update the language in the lang attribute of the html element.
   */
  updateLanguage(): void {
    const lang = document.createAttribute('lang');
    lang.value = this.langCodes[this.translate.currentLang];
    this.el.nativeElement.parentElement.parentElement.attributes.setNamedItem(
      lang
    );
  }

  changeLanguage(): void {
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
    this.updateLanguage();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(e: Event): void {
    if (document.documentElement.scrollTop > 300) {
      this.showGoToTop = true;
    } else {
      this.showGoToTop = false;
    }
  }

  goToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
