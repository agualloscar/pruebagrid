import { AfterContentInit, Component, ContentChild, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid-column/ao-grid-column.component';

@Component({
  selector: 'ao-grid',
  templateUrl: './ao-grid.component.html',
  styleUrls: ['./ao-grid.component.css']
})
export class AOGridComponent implements AfterContentInit  {
  @Input() dataSource: any[] = [];
  @ContentChildren(AOGridColumnComponent) projectedColumns!: QueryList<AOGridColumnComponent>;
  @ContentChild('aoGridActionsTemplate', { static: true }) aoGridActionsTemplate?: TemplateRef<any>;
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  
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
  }

  applyFilter() {
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
  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

}
