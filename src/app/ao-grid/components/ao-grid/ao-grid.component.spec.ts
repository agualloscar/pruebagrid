import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AoGridComponent } from './ao-grid.component';

describe('AoGridComponent', () => {
  let component: AoGridComponent;
  let fixture: ComponentFixture<AoGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AoGridComponent]
    });
    fixture = TestBed.createComponent(AoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
