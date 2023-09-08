import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';

@Component({
  selector: 'ao-grid',
  templateUrl: './ao-grid.component.html',
  styleUrls: ['./ao-grid.component.css']
})
export class AOGridComponent implements AfterContentInit, OnChanges {
  constructor(private cdRef: ChangeDetectorRef) {}
  //paginacion
  itemsToLoad: number = 25; // Aquí se define el Input con valor por defecto de 25
  displayedItems: number = 0; 
  displayedItemsCount: number = this.itemsToLoad;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemsToLoad'] && !changes['itemsToLoad'].firstChange) {
      this.displayedItemsCount = this.itemsToLoad;
    }
  }
  loadMoreItems(): void {
    this.displayedItemsCount += this.itemsToLoad;
    console.log(this.displayedItemsCount)
  }
  getDisplayedItems() {
    const filteredData = this.dataSource.filter(item => {
      for (let key in this.filterModel) {
          const filterValue = this.filterModel[key]?.toLowerCase();
          if (filterValue && item[key].toString().toLowerCase().indexOf(filterValue) === -1) {
              return false;
          }
      }
      return true;
  });

  this.currentItemsToShow = filteredData.slice(0, this.displayedItemsCount);
  }
  currentItemsToShow: any[] = [];
 // itemsToLoad: number = 25;  // Valor por defecto. 

  @Input() set itemsToLoadAtOnce(value: number) {
    this.itemsToLoad = value || this.itemsToLoad;
  }

  ngAfterViewInit() {
    this.loadMoreData();
    this.cdRef.detectChanges();
  }

  loadMoreData() {
    const filteredData = this.getFilteredData();

    const start = this.displayedItems;
    const end = this.displayedItems + this.itemsToLoad;

    const newItems = filteredData.slice(start, end);
    this.currentItemsToShow = [...this.currentItemsToShow, ...newItems];
    this.displayedItems += newItems.length;
}
  
  onScroll(event: any) {
    const target = event.target;
    if (target.offsetHeight + target.scrollTop >= target.scrollHeight) {
      this.loadMoreData();
    }
  }
  //
  @Input() dataSource: any[] = [];
  @ContentChildren(AOGridColumnComponent) projectedColumns!: QueryList<AOGridColumnComponent>;
  @ContentChild('aoGridActionsTemplate', { static: true }) aoGridActionsTemplate?: TemplateRef<any>;
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  @Input() fixedColumns: string[] = [];//fixed column

  columns: AOGridColumnComponent[] = [];
  filterModel: { [key: string]: string } = {};

  hasActions: boolean = false;

  ngAfterContentInit() {
    this.hasActions = !!this.aoGridActionsTemplate;
    console.log(this.hasActions)
    if (this.projectedColumns.length === 0 && this.dataSource.length > 0) {
      const firstItem = this.dataSource[0];
      for (let key in firstItem) {
        const column = new AOGridColumnComponent();
        column.dataField = key;
        this.columns.push(column);

        // Initialize filterModel for the column
        this.filterModel[key] = '';
      }
    } else {
      this.columns = this.projectedColumns.toArray();
    }
    console.log(this.fixedColumns)
  }

  applyFilter() {
     // Reiniciamos los contadores al aplicar el filtro
     this.displayedItems = 0;
     this.displayedItemsCount = this.itemsToLoad;
 
     // Actualizamos los datos mostrados con la nueva data filtrada
     this.updateDisplayedItems();
}
private getFilteredData(): any[] {
  return this.dataSource.filter(item => {
      for (let key in this.filterModel) {
          const filterValue = this.filterModel[key]?.toLowerCase();
          if (filterValue && item[key].toString().toLowerCase().indexOf(filterValue) === -1) {
              return false;
          }
      }
      return true;
  });
}
updateDisplayedItems(): void {
  const filteredData = this.getFilteredData();

  const start = this.displayedItems;
  const end = this.displayedItemsCount;

  this.currentItemsToShow = filteredData.slice(start, end);
  this.displayedItems = this.currentItemsToShow.length;
}
  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

}
