import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AoFilterComponent } from './ao-filter.component';

describe('AoFilterComponent', () => {
  let component: AoFilterComponent;
  let fixture: ComponentFixture<AoFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AoFilterComponent]
    });
    fixture = TestBed.createComponent(AoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
