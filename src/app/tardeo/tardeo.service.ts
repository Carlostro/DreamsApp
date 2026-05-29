// Servicio base para consumir productos Tardeo
// Deshabilitado por defecto, importa y usa cuando lo actives
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TardeoProduct } from './tardeo.model';

@Injectable({ providedIn: 'root' })
export class TardeoService {
  private apiUrl = '/api/tardeo';

  constructor(private http: HttpClient) {}

  getTardeoActivo(): Observable<TardeoProduct | null> {
    return this.http.get<TardeoProduct | null>(`${this.apiUrl}/activo`);
  }

  getAllTardeo(): Observable<TardeoProduct[]> {
    return this.http.get<TardeoProduct[]>(this.apiUrl);
  }
}
