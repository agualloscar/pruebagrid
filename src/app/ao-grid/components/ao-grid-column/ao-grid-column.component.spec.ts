import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AOGridColumnComponent } from './ao-grid-column.component';

describe('AoGridColumnComponent', () => {
  let component: AOGridColumnComponent;
  let fixture: ComponentFixture<AOGridColumnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AOGridColumnComponent]
    });
    fixture = TestBed.createComponent(AOGridColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
