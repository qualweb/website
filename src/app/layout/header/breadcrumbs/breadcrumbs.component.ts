import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  routerSub: Subscription;
  uri: string | null;

  isDarkTheme: Observable<boolean>;

  constructor(
    private router: Router,
    private location: Location,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
    public translate: TranslateService
  ) {
    this.uri = null;
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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
