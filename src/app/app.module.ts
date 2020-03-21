import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from '@material';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
//import {InViewportModule} from '@thisissoon/angular-inviewport';
//import {NgxHighlightModule} from '@petkit/ngx-highlight';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import {HeaderComponent} from './layout/header/header.component';
import {FooterComponent} from './layout/footer/footer.component';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {EvaluationModule} from '@evaluation/evaluation.module';
import {EvaluationPageComponent} from './pages/evaluation-page/evaluation-page.component';
import {BreadcrumbsComponent} from './layout/header/breadcrumbs/breadcrumbs.component';
import {ResultCodeDialogComponent} from '@dialogs/result-code-dialog/result-code-dialog.component';

//import {AngularFittextModule} from 'angular-fittext';
import {AboutPageComponent} from './pages/about-page/about-page.component';
import {ErrorPageComponent} from './pages/error-page/error-page.component';

//import {HIGHLIGHT_OPTIONS, HighlightModule} from 'ngx-highlightjs';
//import xml from 'highlight.js/lib/languages/xml.js';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

const config: SocketIoConfig = { url: '/api', options: {}};

/*export function hljsLanguages() {
  return [
    {name: 'xml', func: xml}
  ];
}*/

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    EvaluationPageComponent,
    BreadcrumbsComponent,
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
    MaterialModule,
    FlexLayoutModule,
    EvaluationModule,
    FormsModule,
    //InViewportModule,
    //NgxHighlightModule,
    //ScrollDispatchModule,
    //AngularFittextModule,
    //HighlightModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [/*{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      languages: hljsLanguages
    }
  }*/],
  entryComponents: [
    ResultCodeDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
