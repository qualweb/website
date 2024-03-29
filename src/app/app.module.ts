import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material/material.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { EvaluationModule } from './evaluation/evaluation.module';
import { EvaluationPageComponent } from './pages/evaluation-page/evaluation-page.component';
import { BreadcrumbsComponent } from './layout/header/breadcrumbs/breadcrumbs.component';
import { ResultCodeDialogComponent } from './dialogs/result-code-dialog/result-code-dialog.component';

import { AboutPageComponent } from './pages/about-page/about-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';

import { highlight } from 'highlight.js';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CustomBreakPointsProvider } from './services/custom-breakpoints';
import { ScrollingModule } from '@angular/cdk/scrolling';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

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
        ErrorPageComponent,
    ],
    imports: [
        ScrollingModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        HttpClientModule,
        MaterialModule,
        FlexLayoutModule,
        EvaluationModule,
        FormsModule,
        HighlightModule,
        Ng2SearchPipeModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
        }),
    ],
    providers: [
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                languages: {
                    typescript: () => import('highlight.js/lib/languages/typescript'),
                    css: () => import('highlight.js/lib/languages/css'),
                    xml: () => import('highlight.js/lib/languages/xml'),
                },
            },
        },
        CustomBreakPointsProvider,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
