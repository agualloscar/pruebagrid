import { Observable } from "rxjs";

export type FixedPosition = 'left' | 'right';

export interface FixedColumn {
    dataField: string;
    position: FixedPosition;
  }

  export interface IDataService {
    fetchData(offset: number, take: number, filters: string): Observable<any>;
  }