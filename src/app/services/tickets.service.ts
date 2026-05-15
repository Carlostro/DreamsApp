
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  // Ruta del servidor para enviar los datos de los tickets
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) { }

  // Método para enviar los datos del ticket al servidor
  enviarTicket(datosTicket: any): Observable<any> {
    // Obtener cliente_id del localStorage si existe
    const cliente_id = localStorage.getItem('userId');
    const ticketConCliente = {
      ...datosTicket,
      cliente_id: cliente_id ? parseInt(cliente_id) : null
    };
    return this.http.post<any>(this.apiUrl, ticketConCliente);
  }

  // Obtener historial de pedidos de un cliente
  getHistorialCliente(cliente_id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial/${cliente_id}`);
  }
}
