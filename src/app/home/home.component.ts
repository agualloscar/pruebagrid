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
  articulos=[
    {
        "producto": "Manzanas",
        "2023-09-01": 50,
        "2023-09-02": 55,
        "2023-09-03": 52,
        "2023-09-04": 53,
        "2023-09-05": 54,
        "2023-09-06": 57,
        "2023-09-07": 51,
        "2023-09-08": 58,
        "2023-09-09": 59,
        "2023-09-10": 56
    },
    {
        "producto": "Peras",
        "2023-09-01": 40,
        "2023-09-02": 42,
        "2023-09-03": 43,
        "2023-09-04": 44,
        "2023-09-05": 46,
        "2023-09-06": 48,
        "2023-09-07": 41,
        "2023-09-08": 47,
        "2023-09-09": 49,
        "2023-09-10": 45
    },
    {
        "producto": "Bananas",
        "2023-09-01": 60,
        "2023-09-02": 59,
        "2023-09-03": 58,
        "2023-09-04": 57,
        "2023-09-05": 56,
        "2023-09-06": 61,
        "2023-09-07": 62,
        "2023-09-08": 64,
        "2023-09-09": 63,
        "2023-09-10": 65
    }
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
