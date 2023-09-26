import { Component, Input } from '@angular/core';
import { ActionButton, ExcelConfig, FixedPosition, HeaderConfig, TagConfig, TextAlign } from '../../types/types';

@Component({
  selector: 'ao-grid-column',
  templateUrl: './ao-grid-column.component.html',
  styleUrls: ['./ao-grid-column.component.css']
})
export class AOGridColumnComponent {
  @Input() dataField: string = '';
  @Input() dataType: 'string' | 'number' | 'action' | 'currency' | 'tag' = 'string';//sea grego currency
  @Input() currencyCode?: string = 'USD';  // Por defecto USD
  //@Input() showFilter?: boolean = false;
  @Input() caption?: string = '';
  @Input() fixed?: FixedPosition | null = null;
  @Input() width?: number;
  @Input() headerClass?: string = ''; // Este es el nuevo input para la clase
  //para definir una columna como action
  @Input() actionButtons?: ActionButton[]; // Nota el cambio a un array y el cambio de nombre.
  @Input() align?: TextAlign = TextAlign.LEFT;//para alinear el contenido
  //para las columnas de tipo tag
  @Input() tagConfig?: TagConfig;
  //para configuracion de los headers
  @Input() headerConfig?: HeaderConfig = {
    align: TextAlign.LEFT
  };
  //configuracion para exportar
  @Input() excelConfig?: ExcelConfig = {
    include: false,
    excelHeader: this.caption??''
}; 
}
