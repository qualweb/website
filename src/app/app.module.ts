import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from '@material';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ApolloModule} from 'apollo-angular';
import {HttpLinkModule} from 'apollo-angular-link-http';
import {InViewportModule} from '@thisissoon/angular-inviewport';
import {NgxHighlightModule} from '@petkit/ngx-highlight';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';

import {HeaderComponent} from './layout/header/header.component';
import {FooterComponent} from './layout/footer/footer.component';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {EvaluationModule} from '@evaluation/evaluation.module';
import {EvaluationPageComponent} from './pages/evaluation-page/evaluation-page.component';
import {BreadcrumbsComponent} from './layout/header/breadcrumbs/breadcrumbs.component';
// import {FloatingBreadcrumbsComponent} from './layout/header/floating-breadcrumbs/floating-breadcrumbs.component';
import {ResultCodeDialogComponent} from '@dialogs/result-code-dialog/result-code-dialog.component';

import {ConfigService} from './services/config.service';
import {MatMenuModule} from '@angular/material';
import {AngularFittextModule} from 'angular-fittext';
import {AboutPageComponent} from './pages/about-page/about-page.component';
import {ErrorPageComponent} from './pages/error-page/error-page.component';

import {HIGHLIGHT_OPTIONS, HighlightModule} from 'ngx-highlightjs';
import xml from 'highlight.js/lib/languages/xml.js';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export function hljsLanguages() {
  return [
    {name: 'xml', func: xml}
  ];
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    EvaluationPageComponent,
    BreadcrumbsComponent,
    // FloatingBreadcrumbsComponent,
    ResultCodeDialogComponent,
    AboutPageComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    MaterialModule,
    FlexLayoutModule,
    EvaluationModule,
    FormsModule,
    InViewportModule,
    NgxHighlightModule,
    ScrollDispatchModule,
    MatMenuModule,
    AngularFittextModule,
    HighlightModule
  ],
  providers: [{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      languages: hljsLanguages
    }
  }],
  entryComponents: [
    ResultCodeDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private configure: ConfigService) {
    this.configure.server();
  }
}
