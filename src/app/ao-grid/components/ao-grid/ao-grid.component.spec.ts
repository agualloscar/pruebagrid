import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AOGridComponent } from './ao-grid.component';
import { DataService } from '../../services/data.service';
import { ActionButton, TextAlign } from '../../types/types';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { CurrencyPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const myActionButtonsH: ActionButton[] = [
  {
    icon: faEdit,
    callback: (item) => console.log(item),
    tooltip: 'Editar',
    btnClass: 'btn-edit'
  }
];
//columns
const columns: AOGridColumnComponent[] = [
  {
    dataField: 'eliminar',
    dataType: 'action',
    caption: 'Editar',
    actionButtons: myActionButtonsH,
    align: TextAlign.CENTER,
    headerConfig: {
      align: TextAlign.CENTER,
    },
    width: 40
  },
  {

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
    excelConfig: {
      include: true
    }
  },
  {
    dataField: 'age',
    dataType: 'currency',
    caption: 'Edad',
    align: TextAlign.RIGHT,
    headerConfig: {
      backgroundColor: '#fff',
      textColor: '#000'
    },
    width: 40,
    excelConfig: {
      include: true,
    }
  }];
describe('AOGridComponent', () => {
  let component: AOGridComponent;  // Define a variable to hold the instance of AOGridComponent
  let fixture: ComponentFixture<AOGridComponent>;  // Define a variable to hold the fixture for AOGridComponent
  let dataService: DataService;  // Define a variable to hold the instance of DataService
  let totalItems = 0;  // Define a variable to keep track of total items

  beforeEach(() => {
    TestBed.configureTestingModule({  // Configure the testing module
      imports: [HttpClientModule],  // Import HttpClientModule
      declarations: [AOGridComponent],  // Declare AOGridComponent
      providers: [DataService, CurrencyPipe],  // Provide DataService and CurrencyPipe
      schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Define schemas
    });

    fixture = TestBed.createComponent(AOGridComponent);  // Create a component fixture
    component = fixture.componentInstance;  // Get the component instance from the fixture
    dataService = TestBed.inject(DataService);  // Inject the real DataService
    component.dataService = dataService;  // Assign the injected service to the component's dataService property
    component.columns = columns;  // Assign the columns array to the component's columns property
    component.filterFields = ["name"];  // Assign the filterFields array to the component's filterFields property
    fixture.detectChanges();  // Trigger change detection to reflect the initial setup
  });


  it('should create', () => {
    expect(component).toBeTruthy();  // Asserts that the component instance should be truthy (i.e., it should exist)
  });

  it('should initialize columns based on projectedColumns or dataSource', async () => {
    // Assuming initializeColumns gets called within ngAfterContentInit
    await component.ngAfterContentInit();  // Awaits the asynchronous execution of ngAfterContentInit method
    await fixture.whenStable();  // Waits for Angular to stabilize the view (i.e., finish rendering)
    // Assert
    totalItems = component.currentItemsToShow.length;  // Updates the totalItems variable with the current number of items to show
    console.log(totalItems);  // Logs the totalItems to the console
    expect(component.columns.length).toBeGreaterThan(0);  // Asserts that the number of columns should be greater than zero
  });


  describe('applyFilter', () => {
    it('should reset displayedItems and update displayed items', () => {
      spyOn(component, 'updateDisplayedItems');  // Spy on the updateDisplayedItems method
      component.applyFilter();  // Call the applyFilter method
      expect(component.displayedItems).toBe(0);  // Assert that displayedItems should be reset to 0
      expect(component.updateDisplayedItems).toHaveBeenCalled();  // Assert that updateDisplayedItems method should have been called
    });
  });

  describe('should show loading', () => {
    it('loading when loading data', async () => {
      component.ngAfterContentInit();  // Call ngAfterContentInit method
      expect(component.isLoading).toBeTrue();  // Assert that isLoading should be true (assuming this triggers loading)
      fixture.detectChanges();  // Detect changes in the component
      await fixture.whenStable();  // Wait for Angular to stabilize the view
      expect(component.isLoading).toBeFalse();  // Assert that isLoading should now be false
      const loadingElement = fixture.debugElement.query(By.css('.loading'));  // Query the loading element by its CSS class
      expect(loadingElement).not.toBeNull();  // Assert that the loading element should be present in the DOM
    });
  });

  describe('when the table activates scroll', () => {
    const eventMock = {
      target: {
        scrollTop: 100,  // or any appropriate value
        offsetHeight: 500,  // or any appropriate value
        scrollHeight: 600  // or any appropriate value
      }
    };
    it('should handle onScroll', async () => {
      spyOn(component, 'loadMoreData').and.callThrough();  // Spy on the loadMoreData method

      component.onScroll(eventMock);  // Call the onScroll method with the mock event

      expect(component.isLoading).toBeTrue();  // Assert that isLoading should now be true
      expect(component.isLoadingMoreData).toBeTrue();  // Assert that isLoadingMoreData should now be true
      expect(component.loadMoreData).toHaveBeenCalled();  // Assert that loadMoreData method should have been called
    });
    it('When scroll is activated it should bring more data', async () => {
      const curentItemsToShow = component.currentItemsToShow.length;
      spyOn(component, 'loadMoreData').and.callThrough();  // Spy on the loadMoreData method again

      component.onScroll(eventMock);  // Call the onScroll method with the mock event again
      await fixture.whenStable();  // Wait for Angular to stabilize

      console.log(curentItemsToShow, component.currentItemsToShow.length)
      expect(component.currentItemsToShow.length).toBeGreaterThan(totalItems);  // Assert that more data should now be displayed
    });
  });

  describe('filter change', () => {
    it('should handle filter change', async () => {
      // Ensure 'columns' have some relevant values
      const newFilters = { name: 'ol' };  // Assuming name corresponds to the dataFields of the columns
      component.handleFilterChange(newFilters);
      // Now verify the results, for example:
      expect(component.filters).toEqual(newFilters);  // Assert that filters have been updated correctly
    });
    it('When changing filter it must bring data', async () => {
      const newFilters = { name: 'ol' };  // Assuming name corresponds to the dataFields of the columns
      component.handleFilterChange(newFilters);
      // We wait because it calls some asynchronous methods
      await fixture.whenStable();
      expect(component.currentItemsToShow.length).toBeGreaterThan(0); // Verify that the filter brought data
    });
    it('should have empty currentItemsToShow when no results are found', async () => {
      const newFilters = { name: 'nonexistent' };  // A filter value that results in no matches
      component.handleFilterChange(newFilters);
      await fixture.whenStable();
      expect(component.currentItemsToShow.length).toBe(0);  // Verify currentItemsToShow is empty
    });
  });


  // A common setup function for 'exportToExcel' tests
  function commonTestSetup() {
    spyOn(document, 'createElement').and.callThrough();  // Spy on document.createElement method
    return component.exportToExcel();  // Call exportToExcel and return the result
  }

  describe('exportToExcel', () => {
    // Test case: ensure excel file creation and download with all data
    it('should create and download excel file with all data', async () => {
      if (component.dataService) {
        spyOn(component.dataService, 'fetchData').and.callThrough();  // Spy on fetchData method of dataService
      }
      await commonTestSetup();  // Call commonTestSetup
      expect(component.dataService?.fetchData).toHaveBeenCalled();  // Assert fetchData was called
      expect(document.createElement).toHaveBeenCalledWith('a');  // Assert createElement was called with 'a'
    });

    // Test case: ensure excel file creation and download with filtered data
    it('should create and download excel file with filtered data', async () => {
      if (component.dataService) {
        spyOn(component.dataService, 'fetchData').and.callThrough();  // Spy on fetchData method of dataService
      }
      const newFilters = { name: 'ol' };
      component.handleFilterChange(newFilters);  // Change filter
      await commonTestSetup();  // Call commonTestSetup
      expect(component.dataService?.fetchData).toHaveBeenCalled();  // Assert fetchData was called
      expect(document.createElement).toHaveBeenCalledWith('a');  // Assert createElement was called with 'a'
    });
  });

  describe('onScroll', () => {
    // Test case: ensure loadMoreData is not called when hasReachedEndOfData is true
    it('should not call loadMoreData when hasReachedEndOfData is true', async () => {
      component.hasReachedEndOfData = true;  // Set hasReachedEndOfData to true
      const eventMock = { target: { scrollTop: 100, offsetHeight: 500, scrollHeight: 600 } };
      spyOn(component, 'loadMoreData');  // Spy on loadMoreData method
      await component.onScroll(eventMock);  // Call onScroll method with eventMock
      expect(component.loadMoreData).not.toHaveBeenCalled();  // Verify loadMoreData was not called
    });
  });
  describe('Action Button Click', () => {
    it('should call the callback when the action button is clicked', async () => {
      spyOn(console, 'log');  // Spy on console.log

      fixture.detectChanges();

      await fixture.whenStable();  // Wait for Angular to stabilize the DOM

      const actionButton = fixture.debugElement.query(By.css('.btn-edit'));
      if (actionButton) {
        actionButton.triggerEventHandler('click', null);  // Trigger the click event
      }

      expect(console.log).toHaveBeenCalled();  // Verify that console.log was called

      (console.log as any).calls.reset();  // Reset the spy
    });
  });

});
