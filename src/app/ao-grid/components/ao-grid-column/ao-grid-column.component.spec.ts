import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AoGridColumnComponent } from './ao-grid-column.component';

describe('AoGridColumnComponent', () => {
  let component: AoGridColumnComponent;
  let fixture: ComponentFixture<AoGridColumnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AoGridColumnComponent]
    });
    fixture = TestBed.createComponent(AoGridColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
