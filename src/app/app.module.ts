import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AOGridModule } from './ao-grid/ao-grid.module';
import { DataService } from './ao-grid/services/data.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AOGridModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
