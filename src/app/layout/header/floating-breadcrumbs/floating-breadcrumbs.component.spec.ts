import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingBreadcrumbsComponent } from './floating-breadcrumbs.component';

describe('FloatingBreadcrumbsComponent', () => {
  let component: FloatingBreadcrumbsComponent;
  let fixture: ComponentFixture<FloatingBreadcrumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingBreadcrumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
