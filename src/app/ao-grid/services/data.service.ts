import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IDataService } from "../types/types";

@Injectable()
export class DataService implements IDataService {
  private apiUrl = 'http://localhost:3000/api/personas';

  constructor(private http: HttpClient) {}

  fetchData(offset: number, take: number, filters: string): Observable<any[]> {
    // Aquí construyes los parámetros basados en los filtros y la paginación.
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('take', take.toString())
      .set('filters', filters);

    return this.http.get<any[]>(this.apiUrl, { params });
  }
}
