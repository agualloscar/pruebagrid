import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AOFilterComponent } from './ao-filter.component';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('AOFilterComponent', () => {
  let component: AOFilterComponent;
  let fixture: ComponentFixture<AOFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AOFilterComponent ],
      imports:[FontAwesomeModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AOFilterComponent);
    component = fixture.componentInstance;
    component.faSearch = faSearch; 
    component.fields=['field1','field2'] // Asignación aquí
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should emit filterChange on onInputChange', () => {
    spyOn(component.filterChange, 'emit');
    const event = { target: { value: 'test' } };
    component.onInputChange(event);
    expect(component.filterChange.emit).toHaveBeenCalledWith({ field1: 'test', field2: 'test' });  // Asumiendo que fields es ['field1', 'field2']
  });
  
  it('should handle Enter key in handleKeyup', () => {
    spyOn(component, 'onInputChange');
    const event = new KeyboardEvent('keyup', { key: 'Enter' });
    component.handleKeyup(event);
    expect(component.onInputChange).toHaveBeenCalledWith(event);
  });
  // ... otros tests para onInputChange, toggleDropdown, handleKeyup, etc.
});
