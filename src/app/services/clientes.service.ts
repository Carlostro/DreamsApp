import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cliente {
  id?: number;
  nombre: string;
  email: string;
  alias: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  cliente?: Cliente;
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  cliente?: Cliente;
  alias?: string;
}

export interface SesionCliente {
  id: number;
  cliente_id: number;
  mesa_code: string;
  sessionId: string;
  inicio_sesion: Date;
  activa: boolean;
}

export interface Bonificacion {
  id: number;
  cliente_id: number;
  mesa_code: string;
  total_ticket: number;
  puntos_acumulados: number;
  fecha_pedido: Date;
  detalles?: string;
}

export interface PuntosCliente {
  id: number;
  nombre: string;
  alias: string;
  email: string;
  total_pedidos: number;
  gasto_total: number;
  puntos_totales: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/clientes`;
  private sesionesUrl = `${environment.apiUrl}/sesiones-clientes`;
  private bonificacionesUrl = `${environment.apiUrl}/bonificaciones`;

  constructor(private http: HttpClient) { }

  /**
   * Registrar un nuevo cliente
   */
  registrarCliente(nombre: string, alias: string, email: string, password: string, autorizacion: boolean): Observable<RegisterResponse> {
    const body = { nombre, alias, email, password, autorizacion };
    return this.http.post<RegisterResponse>(`${this.apiUrl}/registro`, body);
  }

  /**
   * Iniciar sesión con alias y contraseña
   */
  loginCliente(alias: string, password: string): Observable<LoginResponse> {
    const body = { alias, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);
  }

  /**
   * Obtener información del cliente por ID
   */
  obtenerCliente(clienteId: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${clienteId}`);
  }

  /**
   * Verificar si un email ya está registrado
   */
  verificarEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/verificar-email/${email}`);
  }

  /**
   * Verificar si un alias ya está en uso
   */
  verificarAlias(alias: string): Observable<{ exists: boolean, message?: string }> {
    return this.http.get<{ exists: boolean, message?: string }>(`${this.apiUrl}/verificar-alias/${alias}`);
  }

  /**
   * Guardar información del cliente en localStorage
   */
  guardarClienteEnLocal(cliente: Cliente, token?: string): void {
    localStorage.setItem('userAlias', cliente.alias);
    localStorage.setItem('userName', cliente.nombre);
    localStorage.setItem('userEmail', cliente.email);
    if (cliente.id) {
      localStorage.setItem('userId', cliente.id.toString());
    }
    if (token) {
      localStorage.setItem('userToken', token);
    }
    localStorage.setItem('userLoggedIn', 'true');
  }

  /**
   * Obtener información del cliente desde localStorage
   */
  obtenerClienteLocal(): any {
    return {
      alias: localStorage.getItem('userAlias'),
      nombre: localStorage.getItem('userName'),
      email: localStorage.getItem('userEmail'),
      id: localStorage.getItem('userId'),
      loggedIn: localStorage.getItem('userLoggedIn') === 'true'
    };
  }

  /**
   * Cerrar sesión del cliente
   */
  cerrarSesion(): void {
    localStorage.removeItem('userAlias');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userLoggedIn');
  }

  /**
   * Verificar si hay una sesión activa
   */
  tieneSession(): boolean {
    return localStorage.getItem('userLoggedIn') === 'true';
  }

  // ============= SESIONES DE CLIENTES =============

  /**
   * Crear sesión de cliente registrado
   */
  crearSesionCliente(cliente_id: number, mesa_code: string, sessionId: string): Observable<any> {
    return this.http.post(`${this.sesionesUrl}`, { cliente_id, mesa_code, sessionId });
  }

  /**
   * Cerrar sesión de cliente
   */
  cerrarSesionCliente(sessionId: string): Observable<any> {
    return this.http.delete(`${this.sesionesUrl}/${sessionId}`);
  }

  /**
   * Obtener sesión activa de un cliente
   */
  obtenerSesionActiva(cliente_id: number): Observable<any> {
    return this.http.get(`${this.sesionesUrl}/activa/${cliente_id}`);
  }

  // ============= BONIFICACIONES =============

  /**
   * Registrar bonificación por pedido
   */
  registrarBonificacion(cliente_id: number, mesa_code: string, total_ticket: number, detalles?: string): Observable<any> {
    return this.http.post(`${this.bonificacionesUrl}`, { cliente_id, mesa_code, total_ticket, detalles });
  }

  /**
   * Obtener puntos totales de un cliente
   */
  obtenerPuntosCliente(cliente_id: number): Observable<any> {
    return this.http.get(`${this.bonificacionesUrl}/puntos/${cliente_id}`);
  }

  /**
   * Obtener historial de bonificaciones
   */
  obtenerHistorialBonificaciones(cliente_id: number): Observable<any> {
    return this.http.get(`${this.bonificacionesUrl}/historial/${cliente_id}`);
  }

  /**
   * Descontar puntos por canje
   */
  descontarPuntos(cliente_id: number, puntos: number, detalles?: string): Observable<any> {
    return this.http.post(`${this.bonificacionesUrl}/descontar`, { cliente_id, puntos, detalles });
  }
}
