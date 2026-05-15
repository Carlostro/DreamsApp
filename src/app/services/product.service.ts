import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  public apiUrl = environment.apiUrl;

  getTables(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tables`).pipe(
      catchError(this.handleError)
    );
  }

  getTableData(tableName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tables/${tableName}`).pipe(
      catchError(this.handleError)
    );
  }


  getTableColumns(tableName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${tableName}/columns`).pipe(
      catchError(this.handleError)
    );
  }

  updateTableData(tableName: string, id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tables/${tableName}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  addProduct(tableName: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tables/${tableName}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(tableName: string, id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tables/${tableName}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError('Something bad happened; please try again later.');
  }
}
