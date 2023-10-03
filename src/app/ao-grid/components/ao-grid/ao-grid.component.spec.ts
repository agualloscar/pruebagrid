import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AOGridComponent } from './ao-grid.component';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';
import { IDataService, TextAlign } from '../../types/types';
import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { CurrencyPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

//columnas
const columns: AOGridColumnComponent[] = [{
  dataField: 'email',
  dataType: 'string',
  caption: 'Email',
  excelConfig: {
    include: true,

  }
},
{
  dataField: 'address',
  dataType: 'string',
  caption: 'Direccion',
  align: TextAlign.CENTER,
},
{
  dataField: 'age',
  dataType: 'currency',
  caption: 'Edad',
  align: TextAlign.RIGHT,
  headerConfig: {

  },
  width: 40,
  excelConfig: {
    include: true,

  }
}];
describe('AOGridComponent', () => {
  let component: AOGridComponent;
  let fixture: ComponentFixture<AOGridComponent>;
  let dataService: DataService;
  let totalItems=0;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [AOGridComponent],
      providers: [DataService, CurrencyPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(AOGridComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);  // Inyecta el servicio real
    component.dataService = dataService;
    component.filterFields = ["name"];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize columns based on projectedColumns or dataSource', async () => {
    // Assuming initializeColumns gets called within ngAfterContentInit
    await component.ngAfterContentInit();
    await fixture.whenStable(); //porque ngAfterContentInit es asyncrono
    // Assert
    totalItems=component.currentItemsToShow.length;
    console.log(totalItems);
    expect(component.columns.length).toBeGreaterThan(0);
  });

  describe('applyFilter', () => {
    it('should reset displayedItems and update displayed items', () => {
      spyOn(component, 'updateDisplayedItems');
      component.applyFilter();
      expect(component.displayedItems).toBe(0);
      expect(component.updateDisplayedItems).toHaveBeenCalled();
    });
  });

  describe('when the table activates scroll',()=>{
    const eventMock = {
      target: {
        scrollTop: 100,  // o cualquier valor apropiado
        offsetHeight: 500,  // o cualquier valor apropiado
        scrollHeight: 600  // o cualquier valor apropiado
      }
    };
    it('should handle onScroll', async () => {
      spyOn(component, 'loadMoreData').and.callThrough();
  
      component.onScroll(eventMock);
  
      expect(component.isLoading).toBeTrue();
      expect(component.isLoadingMoreData).toBeTrue();
      expect(component.loadMoreData).toHaveBeenCalled();
  
    });
    it('When scroll is activated it should bring more data', async () => {
      const curentItemsToShow = component.currentItemsToShow.length;
      spyOn(component, 'loadMoreData').and.callThrough();
      component.onScroll(eventMock);
      await fixture.whenStable();
      console.log(curentItemsToShow,component.currentItemsToShow.length)
      expect(component.currentItemsToShow.length).toBeGreaterThan(totalItems);
  
    });
  });
  describe('filter change', () => {
    it('should handle filter change', async () => {
      // Asegúrate de que 'columns' tenga algunos valores relevantes
      const newFilters = { name: 'ol' };  // Suponiendo que key1 y key2 corresponden a los dataFields de las columnas
      component.handleFilterChange(newFilters);
      // Ahora verifica los resultados, por ejemplo:
      expect(component.filters).toEqual(newFilters);
    });
    it('When changing filter it must bring data', async () => {
      const newFilters = { name: 'ol' };  // Suponiendo que name corresponde a los dataFields de las columnas
      component.handleFilterChange(newFilters);
      //esperamos porque manda a llamar a unos metodos asincronos
      await fixture.whenStable();
      expect(component.currentItemsToShow.length).toBeGreaterThan(0);//verificamos que trajo datos el filtro
    });
  });
 
});
