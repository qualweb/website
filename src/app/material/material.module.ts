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
  MatTabsModule,
  MatMenuModule
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
    MatTabsModule,
    MatMenuModule
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
    MatTabsModule,
    MatMenuModule
  ]
})
export class MaterialModule { }
