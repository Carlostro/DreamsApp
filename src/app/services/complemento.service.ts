import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComplementoService {

  public apiUrl = `${environment.apiUrl}/complementos`;
  public productosApiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getComplementos(tableName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?table=${tableName}`);
  }
  getNcomplementos(tableName: string, productName: string): Observable<{ Ncomplementos: number }> {
    const encodedTableName = encodeURIComponent(tableName);
    const encodedProductName = encodeURIComponent(productName);
    const url = `${this.productosApiUrl}/${encodedTableName}/${encodedProductName}/ncomplementos`;
    return this.http.get<{ Ncomplementos: number }>(url);
    console.log(url);
  }



}
