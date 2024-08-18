import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Obtener datos de la API
  getData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/data`);
  }

  // Insertar datos en la API
  postData(data: { nombre: string, descripcion: string, categoria: string, precio: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/data`, data);
  }
}
