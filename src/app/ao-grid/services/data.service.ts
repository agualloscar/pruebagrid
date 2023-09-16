import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class DataService {
  private apiUrl = 'http://localhost:3000/api/personas';

  constructor(private http: HttpClient) {}

  fetchData(filters: any, skip: number, take: number): Observable<any[]> {
    // Aquí construyes los parámetros basados en los filtros y la paginación.
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString())
      .set('filters', JSON.stringify(filters));

    return this.http.get<any[]>(this.apiUrl, { params });
  }
}
