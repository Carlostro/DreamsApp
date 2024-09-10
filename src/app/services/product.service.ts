import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable , throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

   //public apiUrl = 'http://localhost:3000/api';
   public apiUrl = 'http://192.168.1.44:3000/api';

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

  updateTableData(tableName: string, id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tables/${tableName}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError('Something bad happened; please try again later.');
  }
}
