import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AOGridComponent } from './ao-grid.component';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';
import { TextAlign } from '../../types/types';
import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { CurrencyPipe } from '@angular/common';
class MockQueryList<T> extends QueryList<T> {
  items: T[]=[];
  override length = 0;  // Add override modifier here

  override toArray() {
    return this.items;
  }
  override reset(items: T[]) {
    this.items = items;
    this.length = items.length;
  }
}
// Mock del servicio DataService
const dataServiceMock = {
  fetchData: jasmine.createSpy('fetchData').and.returnValue(of({ data: [{email:'email@email.com',address:'por ahi',age:28}], total: 1 }))
};
//columnas
 const columns:AOGridColumnComponent[]=[{
      dataField: 'email',
      dataType: 'string',
      caption: 'Email',
      excelConfig:{
        include:true,
        
      }
    },
    {
      dataField: 'address',
      dataType: 'string',
      caption: 'Direccion',
      align:TextAlign.CENTER,
    },
    {
      dataField: 'age',
      dataType: 'currency',
      caption: 'Edad',
      align:TextAlign.RIGHT,
      headerConfig:{
        
      },
      width:40,
      excelConfig:{
        include:true,
        
      }
    }];
describe('AOGridComponent', () => {
  let component: AOGridComponent;
  let fixture: ComponentFixture<AOGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AOGridComponent],
      providers: [{ provide: DataService, useValue: dataServiceMock },CurrencyPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(AOGridComponent);
    component = fixture.componentInstance;
    component.dataService=dataServiceMock;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize columns based on projectedColumns or dataSource', () => {
    
    component.dataSource=[{email:'email@email.com',address:'por ahi',age:28}];
      fixture.detectChanges();

    // Act
    // Assuming initializeColumns gets called within ngAfterContentInit
    component.ngAfterContentInit();
    // Assert
    expect(component.columns.length).toBeGreaterThan(0);
    console.log(component.columns)
    // ... any other assertions related to what initializeColumns does
  });


  describe('applyFilter', () => {
    it('should reset displayedItems and update displayed items', () => {
      spyOn(component, 'updateDisplayedItems');
      component.applyFilter();
      expect(component.displayedItems).toBe(0);
      expect(component.updateDisplayedItems).toHaveBeenCalled();
    });

    // ... más casos de prueba para applyFilter
  });

  // ... otras descripciones y pruebas para diferentes métodos y propiedades

  // ... más pruebas unitarias
});
