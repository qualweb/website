import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import * as _ from 'lodash';
import {ThemeService} from '@app/services/theme.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-floating-breadcrumbs',
  templateUrl: './floating-breadcrumbs.component.html',
  styleUrls: ['./floating-breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingBreadcrumbsComponent implements OnInit, OnDestroy {

  routerSub: Subscription;

  uri: string;

  isDarkTheme: Observable<boolean>;

  constructor(
    private router: Router,
    private location: Location,
    private themeService: ThemeService,
    public translate: TranslateService
  ) {
    this.uri = null;
  }

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const path = this.location.path();
        const segments = _.split(path, '/');

        this.uri = null;

        if (segments.length > 1) {
          this.uri = decodeURIComponent(segments[1]);
        }
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
