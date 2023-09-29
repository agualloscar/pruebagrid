import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faSearch} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'ao-filter',
  templateUrl: './ao-filter.component.html',
  styleUrls: ['./ao-filter.component.css']
})
export class AOFilterComponent {
  faSearch=faSearch;
  @Input() fields: string[] = [];
  @Input() placeholder: string = 'Filter...';
  @Output() filterChange: EventEmitter<{ [key: string]: string }> = new EventEmitter();

  onInputChange(event: any) {
    let inputValue = (event.target as HTMLInputElement).value;
    if(inputValue){
      let filters: { [key: string]: string } = {};

      for (let field of this.fields) {
        filters[field] = inputValue;
      }
  
      this.filterChange.emit(filters);
    }
    else 
    this.filterChange.emit({});
  }
  //logica dropdown
  showDropdown = false;

  // ... Otros métodos y propiedades ...

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  handleKeyup(event: KeyboardEvent) {
    const input: HTMLInputElement = event.target as HTMLInputElement;

    // Si se presionó 'Enter' o si el input está vacío
    if (event.key === 'Enter' || input.value === '') {
        this.onInputChange(event);
    }
}

}
