import { Component, Input } from '@angular/core';
import { FixedPosition } from '../../types/types';

@Component({
  selector: 'ao-grid-column',
  templateUrl: './ao-grid-column.component.html',
  styleUrls: ['./ao-grid-column.component.css']
})
export class AOGridColumnComponent {
  @Input() dataField: string = '';
  @Input() dataType: 'string' | 'number' = 'string';
  @Input() showFilter?: boolean = false;
  @Input() caption?: string=''; 
  @Input() fixed?:FixedPosition |null = null;
  @Input() width?: number = 150;
  @Input() headerClass?: string = ''; // Este es el nuevo input para la clase
}
