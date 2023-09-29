import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AOFilterComponent } from './ao-filter.component';

describe('AoFilterComponent', () => {
  let component: AOFilterComponent;
  let fixture: ComponentFixture<AOFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AOFilterComponent]
    });
    fixture = TestBed.createComponent(AOFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
