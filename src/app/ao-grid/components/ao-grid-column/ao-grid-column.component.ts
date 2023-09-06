import { Component, Input } from '@angular/core';

@Component({
  selector: 'ao-grid-column',
  templateUrl: './ao-grid-column.component.html',
  styleUrls: ['./ao-grid-column.component.css']
})
export class AOGridColumnComponent {
  @Input() dataField: string = '';
  @Input() dataType: 'string' | 'number' = 'string';
  @Input() showFilter: boolean = false;
  @Input() caption: string=''; 
  @Input() fixed: boolean = false;
}
