import { Component, OnInit, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  floatingBreadcrumbs: boolean;

  constructor() {
    this.floatingBreadcrumbs = false;
  }

  ngOnInit() {
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(e): void {
    if (document.documentElement.scrollTop > 50) {
      this.floatingBreadcrumbs = true;
    } else {
      this.floatingBreadcrumbs = false;
    }
  }
}
