import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { faFilter, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FixedColumn, FixedPosition } from '../../types/types';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ao-grid',
  templateUrl: './ao-grid.component.html',
  styleUrls: ['./ao-grid.component.css']
})
export class AOGridComponent implements AfterContentInit, OnChanges {
  faFilter = faFilter;
  
  //paginacion
  itemsToLoad: number = 25; // Aquí se define el Input con valor por defecto de 25
  displayedItems: number = 0;
  displayedItemsCount: number = this.itemsToLoad;

  fixedColumnsSetByInput: boolean = false;  // Añade esta bandera.
  //logica del loadding
  isLoading: boolean = true;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemsToLoad'] && !changes['itemsToLoad'].firstChange) {
      this.displayedItemsCount = this.itemsToLoad;
    }
    if (changes['dataSource']) {
      console.log("entri")
      this.isLoading = true;
      this.updateDisplayedItems();
      setTimeout(() => {
        this.isLoading = false;
      }, 1500);

    }
    if (changes['fixedColumns']) {
      this.fixedColumnsSetByInput = true;
      this.calculateColumnOffsets();
    }
    if (changes['filters']) {
      console.log('se mostro los filters en el aogrid')
      console.log(this.filters)
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
  // loadMoreData() {
  //   const filteredData = this.getFilteredData();

  //   const start = this.displayedItems;
  //   const end = this.displayedItems + this.itemsToLoad;

  //   const newItems = filteredData.slice(start, end);
  //   this.currentItemsToShow = [...this.currentItemsToShow, ...newItems];
  //   this.displayedItems += newItems.length;
  // }
  async loadMoreData() {
    try {
      const offset = 1;
      const take = this.itemsToLoad;
      console.log('offser',offset)
      console.log('take',take)
      const filtersString = encodeURIComponent(JSON.stringify(this.filters));
      const response = await fetch(`http://localhost:3000/api/personas?offset=${offset}&take=${take}&filters=${filtersString}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const newItems = await response.json();
      console.log(newItems)
      this.currentItemsToShow = [...this.currentItemsToShow, ...newItems];
      this.displayedItems += newItems.length;
    } catch (error) {
      console.error("Hubo un problema con la operación fetch:", error);
    }
  }
  
  onScroll(event: any) {
    const target = event.target;
    if (target.offsetHeight + target.scrollTop >= target.scrollHeight) {
      this.isLoading = true
      this.loadMoreData();
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  }
  //
  @Input() dataSource: any[] = [];
  @ContentChildren(AOGridColumnComponent) projectedColumns!: QueryList<AOGridColumnComponent>;
  @ContentChild('aoGridActionsTemplate', { static: true }) aoGridActionsTemplate?: TemplateRef<any>;
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  @Input() fixedColumns: FixedColumn[] = [];//fixed column

  @Input() columns: AOGridColumnComponent[] = [];
  filterModel: { [key: string]: string } = {};

  hasActions: boolean = false;
  //borde columna fijas
  firstLeftFixedColumnDataField?: string;
  lastRightFixedColumnDataField?: string;
  //fin
  private orderColumnsBasedOnFixed(): void {
    // Se crean tres arrays: columnas a la izquierda, columnas no fijas y columnas a la derecha.
    const leftColumns: AOGridColumnComponent[] = [];
    const rightColumns: AOGridColumnComponent[] = [];
    const middleColumns: AOGridColumnComponent[] = [];

    this.columns.forEach(column => {
      const fixedCol = this.fixedColumns.find(fc => fc.dataField === column.dataField);
      if (fixedCol) {
        if (fixedCol.position === 'left') {
          leftColumns.push(column);
        } else if (fixedCol.position === 'right') {
          rightColumns.push(column);
        }
      } else {
        middleColumns.push(column);
      }
    });

    // Se concatenan las columnas en el orden correcto.
    this.columns = [...leftColumns, ...middleColumns, ...rightColumns];

    //borde columna fijas
    if (leftColumns.length > 0) {
      this.firstLeftFixedColumnDataField = leftColumns[0].dataField;
    }

    if (rightColumns.length > 0) {
      this.lastRightFixedColumnDataField = rightColumns[rightColumns.length - 1].dataField;
    }
    //fin
  }
  ngAfterContentInit() {
    this.hasActions = !!this.aoGridActionsTemplate;
    // Si no se han pasado columnas a través del Input
    if (this.columns.length === 0) {
      // Si se han proyectado columnas a través del contenido
      if (this.projectedColumns.length > 0) {
        this.columns = this.projectedColumns.toArray();
      }
      // Si no hay columnas proyectadas y hay datos en el dataSource, generar columnas
      else if (this.dataSource.length > 0) {
        const firstItem = this.dataSource[0];
        for (let key in firstItem) {
          const column = new AOGridColumnComponent();
          column.dataField = key;
          this.columns.push(column);

          // Initialize filterModel for the column
          this.filterModel[key] = '';
        }
      }
    }
    // Si no se han establecido columnas fijas a través del Input
    if (this.fixedColumns.length === 0) {
      this.fixedColumns = this.columns
        .filter(column => column.fixed !== undefined)
        .map(column => ({ dataField: column.dataField, position: column.fixed as FixedPosition }));
    }
    if (this.fixedColumnsSetByInput) {  // Comprueba la bandera aquí.
      this.orderColumnsBasedOnFixed();
    }
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
    console.log(filteredData)
    const start = this.displayedItems;
    const end = this.displayedItemsCount;

    this.currentItemsToShow = filteredData.slice(start, end);
    this.displayedItems = this.currentItemsToShow.length;
    console.log(this.currentItemsToShow)
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
      //borde columna fijas
      if (fixedColumn.position === 'left' && column.dataField === this.firstLeftFixedColumnDataField) {
        styles['border-right'] = '1px solid #000';
      } else if (fixedColumn.position === 'right' && column.dataField === this.lastRightFixedColumnDataField) {
        styles['border-left'] = '1px solid #000';
      }
      //fin borde
      return styles;
    }
    return {};
  }
  getStickyStyleHeader(column: AOGridColumnComponent): any {
    const fixedColumn = this.fixedColumns.find(fixedCol => fixedCol.dataField === column.dataField);

    if (fixedColumn?.position != null) {
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
  //logica de shorting
  currentSortField: string = '';
  sortAscending: boolean = true;
  faSortUp = faSortUp;
  faSortDown = faSortDown;
  toggleSort(dataField: string): void {
    if (this.currentSortField === dataField) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.currentSortField = dataField;
      this.sortAscending = true;
    }
    this.sortData();
  }

  sortData(): void {
    this.dataSource.sort((a, b) => {
      const valueA = a[this.currentSortField];
      const valueB = b[this.currentSortField];

      if (valueA < valueB) {
        return this.sortAscending ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortAscending ? 1 : -1;
      }
      return 0;
    });
    this.displayedItems = 0;
    this.updateDisplayedItems();
  }
  //fin

  //logica para filtros
  @Input() filters: any = {};
  @Input() apiUrl: string = '';
  constructor(private cdRef: ChangeDetectorRef,private http: HttpClient) { }
}
