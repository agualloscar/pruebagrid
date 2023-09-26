import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Observable } from "rxjs";

export type FixedPosition = 'left' | 'right';

export interface FixedColumn {
    dataField: string;
    position: FixedPosition;
  }

  export interface IDataService {
    fetchData(offset: number, take: number, filters: string): Observable<any>;
  }
  //para agregar iconos en las columnas
  export interface ActionButton {
    icon: IconDefinition;  // este es el tipo de FontAwesome. Asegúrate de importarlo.
    callback: (item: any) => void;
    tooltip?: string;
    btnClass?: string;
    iconColor?:string;
  }

  //para alinear el contenido de las columnas
  export enum TextAlign {
    LEFT = 'LEFT',
    CENTER = 'CENTER',
    RIGHT = 'RIGHT'
  }
  //para el formato de la columna tag
  export interface TagConfig {
    backgroundColor?: (data: any) => string;
    textColor?: (data: any) => string;
    formatter?: (data: any) => string;
    width?: number;
    height?: number;
  }

  // src/app/ao-grid/types/types.ts
//para configurar el header
export interface HeaderConfig {
  align?: TextAlign; // Aquí estamos usando TextAlign
  backgroundColor?: string;
  textColor?: string;
}
export interface ExcelConfig {
  include: boolean; // Para decidir si esta columna se incluirá o no.
  excelHeader?: string; // El nombre de esta columna en el archivo Excel.
}

  
  