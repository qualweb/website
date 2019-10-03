import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import _ from 'lodash';

@Component({
  selector: 'app-result-code-dialog',
  templateUrl: './result-code-dialog.component.html',
  styleUrls: ['./result-code-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultCodeDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('iframe') iframe: ElementRef;

  code: string;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.code = _.clone(data);
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
