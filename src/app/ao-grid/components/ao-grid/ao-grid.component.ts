import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';
import { faFilter, faSortUp, faSortDown, faArrowDownAZ, faArrowDownZA, faArrowDown19, faArrowDown91, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { ActionButton, FixedColumn, FixedPosition, IDataService, TextAlign } from '../../types/types';
import { CurrencyPipe } from '@angular/common';
import * as ExcelJS from 'exceljs';
//para excel
import * as XLSX from 'xlsx';
import { BehaviorSubject } from 'rxjs';

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
  //icono excel
  faFileExcel = faFileExcel;

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
    // if (changes['filters']) {
    //   console.log('se mostro los filters en el aogrid')
    //   console.log(this.filters)
    //   // Comprueba si antes tenías filtros y ahora están vacíos
    //   const hadFiltersBefore = Object.keys(this.previousFilters).length !== 0;
    //   const hasNoFiltersNow = Object.keys(this.filters).length === 0;

    //   if (Object.keys(this.filters).length !== 0 || (hadFiltersBefore && hasNoFiltersNow)) {
    //     this.hasReachedEndOfData = false;
    //     await this.loadMoreDataFilter();
    //   }

    //   // Actualiza previousFilters con el estado actual de los filtros
    //   this.previousFilters = { ...this.filters };
    // }
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
    // if (this.fixedColumns.length === 0) {
    //   this.fixedColumns = this.columns
    //     .filter(column => column.fixed !== undefined)
    //     .map(column => ({ dataField: column.dataField, position: column.fixed as FixedPosition }));
    // }
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
  /*@Input()*/ filters: any = {};
  @Input() apiUrl: string = '';
  constructor(private cdRef: ChangeDetectorRef, private currencyPipe: CurrencyPipe) {
    this.filters$.subscribe(newFilters => {
      this.cambiaFiltro(newFilters);
    });
  }
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
  private mapTextAlignToExcel(textAlign: TextAlign): ExcelJS.Alignment['horizontal'] {
    return textAlign.toLowerCase() as ExcelJS.Alignment['horizontal'];
  }
  private toArgb(color: string): string {
    // Función auxiliar para convertir un color en formato rgba a argb
    function rgbaToArgb(rgba: string): string {
        const matches = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d*)\)$/i);
        if (!matches) return '';
        const alpha = (parseFloat(matches[4] || '1') * 255).toString(16).padStart(2, '0');
        return alpha.toUpperCase() + parseInt(matches[1]).toString(16).padStart(2, '0').toUpperCase() +
               parseInt(matches[2]).toString(16).padStart(2, '0').toUpperCase() +
               parseInt(matches[3]).toString(16).padStart(2, '0').toUpperCase();
    }

    // Caso: RGB o RGBA
    if (/^rgba?\(/.test(color)) {
        return rgbaToArgb(color);
    }
    // Caso: hex
    else if (/^#/.test(color)) {
        color = color.slice(1); // Elimina el '#'
        if (color.length === 3) { // Transforma #RGB -> RRGGBB
            color = color.split('').map(char => char + char).join('');
        }
        return 'FF' + color.toUpperCase();
    }
    // En caso de que no se pueda determinar el formato, devuelve un valor por defecto o lanza un error.
    return 'FFFFFFFF'; 
}
  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Sheet1');
    const filtersString = encodeURIComponent(JSON.stringify(this.filters));
    const response = await this.dataService?.fetchData(0, 0, filtersString).toPromise();
    console.log(response)
    if (!response) {
      throw new Error('Network response was not ok');
    }
    const newItems: Array<any> = response.data;

    // Agregar encabezados con estilos
    const headers = this.columns.filter(col => col.excelConfig?.include)
      .map(col => col.excelConfig?.excelHeader ?? col.caption ?? '');

    headers.forEach((header, index) => {
      const column = this.columns.filter(col => col.excelConfig?.include)[index];
      const headerConfig = column?.headerConfig;
      // Aplicar valores por defecto si no se proporciona una configuración
      const bgColor = this.toArgb(headerConfig?.backgroundColor??'#374151');
      const textColor = this.toArgb(headerConfig?.textColor ?? 'FFFFFFFF'); // default color
      const align = this.mapTextAlignToExcel(headerConfig?.align ?? TextAlign.LEFT); // default alignment

      const cell = worksheet.getCell(1, index + 1);
      cell.value = header;
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        },
        font: {
          color: { argb: textColor },
          size: 12,
          bold: true
        },
        alignment: {
          horizontal: align
        }
      };
    });

    // Poblar datos
    newItems.forEach((row, rowIndex) => {
      this.columns.filter(col => col.excelConfig?.include).forEach((col, colIndex) => {
        const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);

        switch (col.dataType) {
          case 'string':
            cell.value = row[col.dataField];
            break;
          case 'number':
          case 'currency':
            if (typeof row[col.dataField] === 'number') {
              cell.value = row[col.dataField];
            } else {
              cell.value = null;
            }
            break;
          default:
            cell.value = row[col.dataField];
        }
      });
    });

    // Ajustar el ancho de las columnas
    this.columns.filter(col => col.excelConfig?.include).forEach((col, colIndex) => {
      let maxLength = (col.excelConfig?.excelHeader ?? col.caption ?? '').length;
      newItems.forEach(row => {
        const cellValue = `${row[col.dataField]}`;
        if (cellValue && cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });
      const buffer = 1.25;
      worksheet.getColumn(colIndex + 1).width = Math.ceil(maxLength * buffer);
    });

    // Escribir a un archivo
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.xlsx';
      a.click();
    });
  }



  //para el tipo de loading
  @Input() loadingType: 'spinner' | 'bar' = 'spinner';  // por defecto será 'spinner'

  //para el filtrado
  filtersNew: any = {};
  @Input() filterFields: Array<string> = [];
  currentFilters: { [key: string]: string } = {};
  private _filtersSubject: BehaviorSubject<{ [key: string]: string } | null> = new BehaviorSubject(this.filtersNew);
  filters$ = this._filtersSubject.asObservable();

  handleFilterChange(newFilters: { [key: string]: any }) {
    console.log('se dio enter', newFilters);

    // Itera sobre las claves en newFilters
    Object.keys(newFilters).forEach(key => {
      // Encuentra una columna en this.columns que coincida con la clave actual
      const matchingColumn = this.columns.find(column => column.dataField === key);
      console.log(matchingColumn)
      if (matchingColumn) {
        console.log(matchingColumn.dataType)
        switch (matchingColumn.dataType) {
          case 'currency':
          case 'number':

            // Verifica si el valor es realmente un número
            if (isNaN(Number(newFilters[key]))) {
              console.log('no es numero')
              // Si no es un número, elimina esa propiedad de newFilters
              delete newFilters[key];
            } else {
              // Si es un número, lo convierte a su representación en cadena (opcional, según tus necesidades)
              newFilters[key] = Number(newFilters[key]);
            }
            break;
          case 'string':
            // Si es un string, no necesita hacer nada
            break;
          // Puedes agregar más casos aquí para otros dataTypes
          default:
            // Si no sabes cómo manejar un dataType específico, simplemente deja el valor como está
            break;
        }
      }
    });

    // Actualiza el valor de this.filters
    this.filters = newFilters;

    // Notifica a los suscriptores del cambio
    this._filtersSubject.next(newFilters);
  }

  async cambiaFiltro(filtro: any) {
    console.log('cambio filtro', filtro)
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
