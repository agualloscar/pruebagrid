import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { faFilter, faSortUp, faSortDown, faArrowDownAZ, faArrowDownZA, faArrowDown19, faArrowDown91 } from '@fortawesome/free-solid-svg-icons';
import { ActionButton, FixedColumn, FixedPosition, IDataService, TextAlign } from '../../types/types';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
//para excel
import * as XLSX from 'xlsx';

@Component({
  selector: 'ao-grid',
  templateUrl: './ao-grid.component.html',
  styleUrls: ['./ao-grid.component.css']
})
export class AOGridComponent implements AfterContentInit, OnChanges {
  //flechas de sort
  faArrowDownAZ = faArrowDownAZ;
  faArrowDownZA = faArrowDownZA;
  faArrowDown19 = faArrowDown19;
  faArrowDown91 = faArrowDown91;

  faFilter = faFilter;
  TextAlign = TextAlign;
  //paginacion
  itemsToLoad: number = 25; // Aquí se define el Input con valor por defecto de 25
  displayedItems: number = 0;
  displayedItemsCount: number = this.itemsToLoad;
  skip: number = 1;

  fixedColumnsSetByInput: boolean = false;  // Añade esta bandera.
  //logica del loadding
  isLoading: boolean = true;

  //para rastear si trenia filtros anteriomente
  previousFilters: any = {};

  async ngOnChanges(changes: SimpleChanges) {
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
      console.log('fixedIput', this.fixedColumnsSetByInput);
      //this.calculateColumnOffsets();
    }
    if (changes['filters']) {
      console.log('se mostro los filters en el aogrid')
      console.log(this.filters)
      // Comprueba si antes tenías filtros y ahora están vacíos
      const hadFiltersBefore = Object.keys(this.previousFilters).length !== 0;
      const hasNoFiltersNow = Object.keys(this.filters).length === 0;

      if (Object.keys(this.filters).length !== 0 || (hadFiltersBefore && hasNoFiltersNow)) {
        this.hasReachedEndOfData = false;
        await this.loadMoreDataFilter();
      }

      // Actualiza previousFilters con el estado actual de los filtros
      this.previousFilters = { ...this.filters };
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

  async ngAfterViewInit() {
    await this.loadMoreData();
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
  async loadMoreDataFilter() {
    try {
      this.skip = 1;//esto es porque se reinicia el filter
      const offset = this.skip;
      const take = this.itemsToLoad;
      console.log('este es el offset', offset)
      const filtersString = encodeURIComponent(JSON.stringify(this.filters));
      const response = await this.dataService?.fetchData(offset, take, filtersString).toPromise();
      console.log(response)
      if (!response) {
        throw new Error('Network response was not ok');
      }
      const newItems = response.data;
      // Si recibimos menos elementos de los esperados, probablemente hemos llegado al final.
      if (newItems.length < this.itemsToLoad) {
        this.hasReachedEndOfData = true;
      }
      if (this.total !== response.total) {
        this.total = response.total;
      }
      this.total = Number(response.total);
      this.currentItemsToShow = [...newItems];
      this.displayedItems += newItems.length;
      this.skip++;
    } catch (error) {
      console.error("Hubo un problema con la operación fetch:", error);
    }
  }
  total!: number;
  async loadMoreData() {
    try {
      const offset = this.skip;
      const take = this.itemsToLoad;
      console.log('este es el offset', offset)
      const filtersString = encodeURIComponent(JSON.stringify(this.filters));
      const response = await this.dataService?.fetchData(offset, take, filtersString).toPromise();
      console.log(response)
      if (!response) {
        throw new Error('Network response was not ok');
      }
      const newItems = response.data;
      // Si recibimos menos elementos de los esperados, probablemente hemos llegado al final.
      if (newItems.length < this.itemsToLoad) {
        this.hasReachedEndOfData = true;
      }
      if (this.total !== response.total) {
        this.total = response.total;
      }
      this.currentItemsToShow = [...this.currentItemsToShow, ...newItems];
      this.displayedItems += newItems.length;
      this.skip++;
    } catch (error) {
      console.error("Hubo un problema con la operación fetch:", error);
    }
  }
  isLoadingMoreData: boolean = false;
  previousScrollTop: number = 0;//para manejar el scroll hacia arriba
  hasReachedEndOfData: boolean = false;//para validar que llego al final y no haga scroll
  async onScroll(event: any) {
    const target = event.target;

    // Comprueba si el desplazamiento actual es mayor que el desplazamiento anterior.
    const isScrollingDown = target.scrollTop > this.previousScrollTop;

    // Actualiza el desplazamiento anterior.
    this.previousScrollTop = target.scrollTop;

    if (!this.isLoadingMoreData && !this.hasReachedEndOfData && isScrollingDown && target.offsetHeight + target.scrollTop >= target.scrollHeight) {
      this.isLoading = true;
      this.isLoadingMoreData = true;
      await this.loadMoreData();
      setTimeout(() => {
        this.isLoading = false;
        this.isLoadingMoreData = false;
      }, 500);
    }
  }
  // async onScroll(event: any) {
  //   const target = event.target;
  //   if (target.offsetHeight + target.scrollTop >= target.scrollHeight) {
  //     this.isLoading = true
  //     await this.loadMoreData();
  //     setTimeout(() => {
  //       this.isLoading = false;

  //     }, 500);
  //   }
  // }
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
    console.log('columnas derecha', rightColumns)

    //borde columna fijas
    if (leftColumns.length > 0) {
      this.firstLeftFixedColumnDataField = leftColumns[leftColumns.length - 1].dataField;
    }

    if (rightColumns.length > 0) {
      this.lastRightFixedColumnDataField = rightColumns[0].dataField;
    }
    console.log('colmna derecha', this.lastRightFixedColumnDataField)
    console.log('colmna izquierda', this.firstLeftFixedColumnDataField)
    //fin
  }
  @Input() dataService?: IDataService;
  ngAfterContentInit() {
    const take = this.itemsToLoad;
    const filtersString = encodeURIComponent(JSON.stringify(this.filters));
    // Si dataSource no se ha pasado como Input, cargarlo del dataService
    if (!this.dataSource || this.dataSource.length === 0) {
      this.dataService?.fetchData(this.skip, take, filtersString).subscribe(data => {
        this.dataSource = data.data;
        this.initializeColumns();
      });
    } else {
      this.initializeColumns();
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 1000)

  }
  private initializeColumns() {
    console.log(this.dataSource)
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
        // styles['max-width'] = `${column.width}px`;//se comento porque si vieene un dato mas grande no se hara mas grande
      }
      //borde columna fijas
      if (fixedColumn.position === 'left' && column.dataField === this.firstLeftFixedColumnDataField) {
        styles['border-right'] = '1px solid rgba(113,128,150,0.4)';
      } else if (fixedColumn.position === 'right' && column.dataField === this.lastRightFixedColumnDataField) {
        styles['border-left'] = '1px solid rgba(113,128,150,0.4)';
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
        'min-width': `${column.width}px`,
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
  constructor(private cdRef: ChangeDetectorRef, private currencyPipe: CurrencyPipe) { }
  //fin

  //logica para iconos en actions
  @Input() actionButtons: ActionButton[] = [];

  //logica para el currency
  formatData(item: any, column: AOGridColumnComponent): string | null {
    if (column.dataType === 'currency') {
      return this.currencyPipe.transform(item[column.dataField], column.currencyCode);
    }
    return item[column.dataField];
  }

  //logica para exportar a excel
  exportToExcel() {
    // Obtener columnas que se incluirán en el Excel
    const columnsToInclude = this.columns.filter(col => col.excelConfig?.include);

    const filteredData = this.currentItemsToShow.map((row) => {
      const newRow: any = {};
      columnsToInclude.forEach(col => {
        newRow[col.excelConfig?.excelHeader ?? col.caption ?? ''] = row[col.dataField];
      });
      return newRow;
    });
    const buffer = 1.10; // Ajusta este valor según tus necesidades.
    const colWidths = columnsToInclude.map(col => {
      let maxLength = (col.excelConfig?.excelHeader ?? col.caption ?? '').length; // inicialmente el tamaño del encabezado
      this.currentItemsToShow.forEach(row => {
        const cellValue = `${row[col.dataField]}`;
        if (cellValue && cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });
      return { wch: Math.ceil(maxLength * buffer) };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData, { skipHeader: true });

    // Aplicar las longitudes al objeto de hoja de trabajo
    ws['!cols'] = colWidths;
    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData, { skipHeader: true });

    // Crear los encabezados personalizados
    const headers = columnsToInclude.map(col => col.excelConfig?.excelHeader ?? col.caption ?? '');
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    // Configurar tipo de dato de celdas
    let colIndex = 0;
    columnsToInclude.forEach((col) => {
      // Establece el tipo de dato del encabezado
      const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      ws[headerCellRef].t = 's';  // Encabezado siempre es string

      // Establece el tipo de dato para las celdas de datos basado en la configuración de columna
      for (let rowIndex = 0; rowIndex < this.currentItemsToShow.length; rowIndex++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
        if (ws[cellRef]) {
          switch (col.dataType) {
            case 'string':
              ws[cellRef].t = 's';
              break;
            case 'number':
            case 'currency':
              ws[cellRef].t = 'n';
              break;
            default:
              ws[cellRef].t = 's';
          }
        }
      }

      colIndex++;
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'data.xlsx');
  }




}
