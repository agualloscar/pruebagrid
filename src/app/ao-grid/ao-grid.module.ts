import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AOGridComponent } from './components/ao-grid/ao-grid.component';
import { AOGridColumnComponent } from './components/ao-grid-column/ao-grid-column.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AOGridComponent,
    AOGridColumnComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports:[AOGridComponent,AOGridColumnComponent]
})
export class AOGridModule { }
