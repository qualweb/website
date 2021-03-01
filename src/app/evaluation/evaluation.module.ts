import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UrlInputComponent } from './url-input/url-input.component';
import { EvaluationConfigurationComponent } from './evaluation-configuration/evaluation-configuration.component';

@NgModule({
  declarations: [UrlInputComponent, EvaluationConfigurationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [UrlInputComponent, EvaluationConfigurationComponent],
})
export class EvaluationModule {}
