import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplementoService {
  public apiUrl = 'http://localhost:3000/api/complementos';
  public productosApiUrl ='http://localhost:3000/api/productos';
  //public apiUrl = 'http://192.168.1.41:3000/api/complementos';

  constructor(private http: HttpClient) {}

  getComplementos(tableName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?table=${tableName}`);
  }
  getNcomplementos(tableName: string, productName: string): Observable<{ Ncomplementos: number }> {
    const encodedTableName = encodeURIComponent(tableName);
    const encodedProductName = encodeURIComponent(productName);
    const url = `${this.productosApiUrl}/${encodedTableName}/${encodedProductName}/ncomplementos`;
    return this.http.get<{ Ncomplementos: number }>(url);
  }



}
