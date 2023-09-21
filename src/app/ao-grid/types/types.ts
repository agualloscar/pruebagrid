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
  