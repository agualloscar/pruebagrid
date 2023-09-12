import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FixedPosition } from '../../types/types';

@Component({
  selector: 'ao-grid',
  templateUrl: './ao-grid.component.html',
  styleUrls: ['./ao-grid.component.css']
})
export class AOGridComponent implements AfterContentInit, OnChanges {
  faFilter = faFilter;
  constructor(private cdRef: ChangeDetectorRef) { }
  //paginacion
  itemsToLoad: number = 25; // Aquí se define el Input con valor por defecto de 25
  displayedItems: number = 0;
  displayedItemsCount: number = this.itemsToLoad;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemsToLoad'] && !changes['itemsToLoad'].firstChange) {
      this.displayedItemsCount = this.itemsToLoad;
    }
    if (changes['dataSource']) {
      console.log("entri")
      this.updateDisplayedItems();
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
    this.calculateColumnOffsets();
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

  @Input() fixedColumns: { dataField: string, position: FixedPosition }[] = [];//fixed column

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
    this.fixedColumns = this.projectedColumns
      .filter(column => column.fixed !== undefined)
      .map(column => ({ dataField: column.dataField, position: column.fixed as FixedPosition }));

    console.log(this.fixedColumns);

    //this.calculateColumnOffsets();
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

  //columnas fijas
  columnOffsets: { [dataField: string]: number } = {};
  calculateColumnOffsets() {

    if (!this.tableElement || !this.tableElement.nativeElement) return;

    const table: HTMLTableElement = this.tableElement.nativeElement;
    if (!table.rows || !table.rows.length) return;

    const row: HTMLTableRowElement = table.rows[0];
    let accumulatedWidthLeft = 0;

    // Handle the left fixed columns
    this.columns.forEach((column, index) => {
        const cell: HTMLTableCellElement = row.cells[index];
        const fixedColumn = this.fixedColumns.find(fixedCol => fixedCol.dataField === column.dataField);
        
        if (fixedColumn && fixedColumn.position === 'left') {
            this.columnOffsets[column.dataField] = accumulatedWidthLeft;
            accumulatedWidthLeft += cell.offsetWidth;
        }
    });

    // Handle the right fixed columns
    const rightFixedColumns = this.fixedColumns
        .filter(col => col.position === 'right')
        .reverse();

    let accumulatedWidthRight = -1;

    rightFixedColumns.forEach(column => {
        const cellIndex = this.columns.findIndex(col => col.dataField === column.dataField);
        const cell: HTMLTableCellElement = row.cells[cellIndex];
        if (cell) {
            this.columnOffsets[column.dataField] = accumulatedWidthRight;
            accumulatedWidthRight += cell.offsetWidth;
        }
    });

    console.log(this.columnOffsets);
}

  
  getStickyStyle(column: AOGridColumnComponent): any {
    const fixedColumn = this.fixedColumns.find(fixedCol => fixedCol.dataField === column.dataField) || null;
    if (fixedColumn?.position != null) {
        const styles = {
            'position': 'sticky',
            [fixedColumn.position]: `${this.columnOffsets[column.dataField]}px`,
            'z-index': 15,
        };

        if (column.width) {
            styles['width'] = `${column.width}px`;
            styles['min-width'] = `${column.width}px`;
            styles['max-width'] = `${column.width}px`;
        }

        return styles;
    }
    return {};
  }
  
  getStickyStyleHeader(column: AOGridColumnComponent): any {
    const fixedColumn = this.fixedColumns.find(fixedCol => fixedCol.dataField === column.dataField);
    
    if (fixedColumn?.position!=null) {
      return {
        'position': 'sticky',
        [fixedColumn.position]: `${this.columnOffsets[column.dataField]}px`,
        'z-index': 40,
        'width': `${column.width}px`,
      };
    }
    return {};
  }
  
  @ViewChild('tableElement', { static: false }) tableElement!: ElementRef;
}
