import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AOGridColumnComponent } from '../ao-grid/components/ao-grid-column/ao-grid-column.component';
import { ActionButton, FixedColumn, IDataService, TextAlign } from '../ao-grid/types/types';
import { DataService } from '../ao-grid/services/data.service';
import { faEdit, faTrash,faTable } from '@fortawesome/free-solid-svg-icons';
type Articulo = {
  producto: string;
  [date: string]: string | number;
};
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  constructor(private dataService:DataService) { 
    this.myActionButtons= [
      {
        icon: faEdit,
        callback: (item) => this.editItem(item),
        tooltip: 'Editar',
        btnClass: 'btn-edit'
      },
      {
        icon: faTrash,
        callback: (item) => this.deleteItem(item),
        tooltip: 'Eliminar',
        btnClass: 'btn-delete'
      },
      // ... otros botones
    ];
  }
  get dataFunction(): IDataService {
    return {
      fetchData: this.dataService.fetchData.bind(this.dataService)
    };
  }
  ngOnInit(): void {
    //this.articulos=this.generateData();
    this.myData = this.generateDataProducts(10000);
    this.myActionButtons= [
      {
        icon: faEdit,
        callback: (item) => this.editItem(item),
        tooltip: 'Editar',
        btnClass: 'btn-edit',
        iconColor:'red'
      },
      {
        icon: faTrash,
        callback: (item) => this.deleteItem(item),
        tooltip: 'Eliminar',
        btnClass: 'btn-delete',
        iconColor:'green'
      },
      {
        icon: faTable,
        callback: (item) => this.deleteItem(item),
        tooltip: 'Eliminar',
        btnClass: 'btn-delete',
        iconColor:'blue'
      }
      // ... otros botones
    ];
    const myActionButtonsH:ActionButton[]= [
      {
        icon: faEdit,
        callback: (item) => this.editItem(item),
        tooltip: 'Editar',
        btnClass: 'btn-edit'
      }
    ];
    this.columnsConfig=[
      // Aquí tus definiciones de columnas
      
      {
        dataField:'eliminar',
        dataType:'action',
        caption:'Editar',
        actionButtons:myActionButtonsH,
        align:TextAlign.CENTER,
        headerConfig:{
          align:TextAlign.CENTER,
        },
        width:40
      },
      {
        dataField: 'id',
        dataType: 'tag',
        caption: 'ID',
        fixed: 'left',
        headerClass: '',
        align:TextAlign.CENTER,
        tagConfig: {
          backgroundColor:(data)=> data.id%2==0?'	rgba(0,100,0,0.7)':'rgba(255,0,0,0.7)',
          textColor:(data)=> 'white',
          formatter: (data) => data.id%2==0 ? 'Activo' : 'Inactivo',
          // width: 60,
          // height: 60
        },
        headerConfig:{
          align:TextAlign.CENTER,
          // backgroundColor:'#fff',
          // textColor:'black'
        }
      },
      {
        dataField: 'name',
        dataType: 'string',
        caption: 'Nombre',
        excelConfig:{
          include:true,

        }
      },
      {
        dataField: 'email',
        dataType: 'string',
        caption: 'Email',
        excelConfig:{
          include:true,
          
        }
      },
      {
        dataField: 'address',
        dataType: 'string',
        caption: 'Direccion',
        align:TextAlign.CENTER,
      },
      {
        dataField: 'age',
        dataType: 'currency',
        caption: 'Edad',
        align:TextAlign.RIGHT,
        headerConfig:{
          
        },
        width:40,
        excelConfig:{
          include:true,
          
        }
      },
      {
        dataField:'editar',
        dataType:'action',
        caption:'Acciones',
        actionButtons:this.myActionButtons,
        width:40
      }
    ];
    //console.log(this.myData)
  }
  generaData() {
    // console.log(this.myData);
    // var data=this.myData[0];
    // delete data["id"];
    // this.http.post('http://localhost:3000/api/personas',data).subscribe(res=>{
    //     console.log(res);
    // });
   

  }
  articulos: Articulo[] = [];

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
        email: this.generateRandomString(10) + "@example.com",
        address: this.generateRandomString(60),
        country: this.generateRandomString(12),
        year: Math.floor(Math.random() * 40) + 2000
      });
    }
    return records;
  }

  myData: any[] = [
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
  }
  // En el componente padre
  columnsConfig: AOGridColumnComponent[]=[];
  fixedColumnsConfig: FixedColumn[] = [
    {
      dataField: 'id',
      position: 'left'
    },
    {
      dataField: 'eliminar',
      position: 'left'
    }
    ,
    {
      dataField: 'age',
      position: 'right',
    },
    {
      dataField: 'editar',
      position: 'right'
    }
  ];
  // En el template del componente padre

  //filters
  currentFilters: { [key: string]: string } = {};

  handleFilterChange(newFilters: { [key: string]: string }) {
    this.currentFilters = newFilters;
  }

  //actions buttons
  myActionButtons!: ActionButton[];
}
