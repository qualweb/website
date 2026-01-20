import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'new-footer',
  templateUrl: './new-footer.component.html',
  styleUrls: ['./new-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewFooterComponent implements OnInit {

  // selectedLang: string;

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
    // this.selectedLang = this.translate.currentLang;
  }

 /*
  changeLanguage(): void {
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }
  */
}
