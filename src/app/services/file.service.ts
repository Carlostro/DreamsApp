import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  //private apiUrl = 'http://localhost:3000/api/write-to-file';
  private apiUrl = 'http://192.168.1.44:3000/api/write-to-file';

  constructor(private http: HttpClient) {}

  writeToFile(filename: string, data: string): Observable<any> {
    return this.http.post(this.apiUrl, { filename, data });
  }
}
