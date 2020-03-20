import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Location} from '@angular/common';
import {Router, NavigationEnd} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {ThemeService} from '@app/services/theme.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

  routerSub: Subscription;
  uri: string;

  isDarkTheme: Observable<boolean>;

  constructor(
    private router: Router,
    private location: Location,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
    public translate: TranslateService
  ) {
    this.uri = null;
  }

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const path = this.location.path();
        const segments = path.split('/');

        this.uri = null;

        if (segments.length > 1) {
          this.uri = decodeURIComponent(segments[1]);
        }

        this.cd.detectChanges();
      }
    });
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  changeLanguage(lang): void {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

}
