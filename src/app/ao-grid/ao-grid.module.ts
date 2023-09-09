import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AOGridComponent } from './components/ao-grid/ao-grid.component';
import { AOGridColumnComponent } from './components/ao-grid-column/ao-grid-column.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [
    AOGridComponent,
    AOGridColumnComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    InfiniteScrollModule,
    FontAwesomeModule
  ],
  exports:[AOGridComponent,AOGridColumnComponent]
})
export class AOGridModule { }
