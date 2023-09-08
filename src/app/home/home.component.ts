import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
type Articulo = {
  producto: string;
  [date: string]: string | number;
};
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{
  constructor( private http: HttpClient){}
  ngOnInit(): void {
    //this.articulos=this.generateData();
    this.myData=this.generateDataProducts(100000);
    //console.log(this.myData)
  }

articulos: Articulo[]=[];

generateData(): Articulo[] {
    const startDate = new Date('2023-09-01');
    const products = ["Manzanas", "Peras", "Bananas", "Uvas", "Naranjas", "Fresas", "Mangos", "Piñas", "Melones", "Sandías"];
    const records: Articulo[] = [];

    for (let i = 0; i < 10000; i++) {
        let record: Partial<Articulo> = {
            producto: products[Math.floor(Math.random() * products.length)]
        };

        for (let j = 0; j < 100; j++) {
            let date = new Date(startDate);
            date.setDate(startDate.getDate() + j);
            record[date.toISOString().split('T')[0]] = Math.floor(Math.random() * 100) + 1;  // Random number between 1 and 100
        }

        records.push(record as Articulo);
    }

    return records;
}
 generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

generateDataProducts(count: number) {
  const records = [];
  for (let i = 0; i < count; i++) {
      records.push({
          id: i + 1,
          name: this.generateRandomString(5) + " " + this.generateRandomString(7),
          age: Math.floor(Math.random() * 40) + 20,
          email: this.generateRandomString(10) + "@example.com"
      });
  }
  return records;
}

  myData :any[]= [
    // { id: 1, name: 'John Doe', age: 25, email: 'john@example.com' },
    // { id: 1, name: 'Jehn Doe', age: 22, email: 'es un ejemplo' },
    // { id: 1, name: 'oscar aguallo', age: 27, email: 'agualogil_oscar@example.comsassssssssssssaaaaaaaa' },
    // { id: 1, name: 'Renan uriel', age: 36, email: 'renana@mail.com' },
    // { id: 1, name: 'maria perez', age: 24, email: 'maria@mail.com.mx' }
  ];
//   articulos=[
//     {
//         "producto": "Manzanas",
//         "2023-09-01": 50,
//         "2023-09-02": 55,
//         "2023-09-03": 52,
//         "2023-09-04": 53,
//         "2023-09-05": 54,
//         "2023-09-06": 57,
//         "2023-09-07": 51,
//         "2023-09-08": 58,
//         "2023-09-09": 59,
//         "2023-09-10": 56
//     },
//     {
//         "producto": "Peras",
//         "2023-09-01": 40,
//         "2023-09-02": 42,
//         "2023-09-03": 43,
//         "2023-09-04": 44,
//         "2023-09-05": 46,
//         "2023-09-06": 48,
//         "2023-09-07": 41,
//         "2023-09-08": 47,
//         "2023-09-09": 49,
//         "2023-09-10": 45
//     },
//     {
//         "producto": "Bananas",
//         "2023-09-01": 60,
//         "2023-09-02": 59,
//         "2023-09-03": 58,
//         "2023-09-04": 57,
//         "2023-09-05": 56,
//         "2023-09-06": 61,
//         "2023-09-07": 62,
//         "2023-09-08": 64,
//         "2023-09-09": 63,
//         "2023-09-10": 65
//     }
// ];
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
