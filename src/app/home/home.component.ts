import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  myData = [
    { id: 1, name: 'John Doe', age: 25, email: 'john@example.com' },
    { id: 1, name: 'Jehn Doe', age: 22, email: 'es un ejemplo' },
    { id: 1, name: 'oscar aguallo', age: 27, email: 'agualogil_oscar@example.comsassssssssssssaaaaaaaa' },
    { id: 1, name: 'Renan uriel', age: 36, email: 'renana@mail.com' },
    { id: 1, name: 'maria perez', age: 24, email: 'maria@mail.com.mx' },
  ];
  editItem(item: any) {
    // Implementa la lógica para editar el ítem.
    console.log("Editar", item);
}

deleteItem(item: any) {
    // Implementa la lógica para eliminar el ítem.
    console.log("Eliminar", item);
    const index=this.myData.findIndex(i=>i.id==item.id);
    if(index>-1)
      this.myData.splice(index,1);
}
}
