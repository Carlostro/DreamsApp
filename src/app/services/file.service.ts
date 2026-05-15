import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = `${environment.apiUrl}/write-to-file`;

  constructor(private http: HttpClient) {}

  writeToFile(filename: string, data: string): Observable<any> {
    return this.http.post(this.apiUrl, { filename, data });
  }
}
