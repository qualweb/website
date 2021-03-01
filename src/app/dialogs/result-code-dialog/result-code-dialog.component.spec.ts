import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCodeDialogComponent } from './result-code-dialog.component';

describe('ResultCodeDialogComponent', () => {
  let component: ResultCodeDialogComponent;
  let fixture: ComponentFixture<ResultCodeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultCodeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
