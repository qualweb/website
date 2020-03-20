import {Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import clone from 'lodash.clone';

@Component({
  selector: 'app-result-code-dialog',
  templateUrl: './result-code-dialog.component.html',
  styleUrls: ['./result-code-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultCodeDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('iframe', {static: true}) iframe: ElementRef;

  code: string;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.code = clone(data);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const iframe = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    iframe.open();
    iframe.write(this.code);
    iframe.close();
  }
}
