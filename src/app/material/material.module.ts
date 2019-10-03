import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatDividerModule,
  MatToolbarModule,
  MatSelectModule,
  MatListModule,
  MatCheckboxModule,
  MatDialogModule,
  MatTabsModule
} from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatToolbarModule,
    MatSelectModule,
    MatListModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTabsModule
  ],
  exports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatToolbarModule,
    MatSelectModule,
    MatListModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTabsModule
  ]
})
export class MaterialModule { }
