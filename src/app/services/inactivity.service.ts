import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimer: any;
  private readonly INACTIVITY_TIME = 3 * 60 * 1000; // 3 minutos en milisegundos
  private redirectUrl: string = 'https://www.instagram.com/dreamsalzira';
  private isActive: boolean = false;
  private fixedTimeout: boolean = false; // Modo timeout fijo sin reseteo
  private apiUrl = `${environment.apiUrl}/active-tables`;
  private sesionesUrl = `${environment.apiUrl}/sesiones-clientes`;
  private boundResetTimer: () => void; // Referencia única para addEventListener/removeEventListener

  constructor(private router: Router, private http: HttpClient) {
    this.boundResetTimer = this.resetTimer.bind(this);
  }

  /**
   * Iniciar el temporizador de inactividad
   * @param useFixedTimeout Si es true, usa timeout fijo sin reseteo (para login/registro)
   */
  startWatching(useFixedTimeout: boolean = false): void {
    if (this.isActive) {
      return; // Ya está activo
    }

    this.isActive = true;
    this.fixedTimeout = useFixedTimeout;

    if (useFixedTimeout) {
      // Modo timeout fijo: 3 minutos sin reseteo
      console.log('[INACTIVITY] Timeout fijo iniciado (3 minutos sin reseteo)');
      this.inactivityTimer = setTimeout(() => {
        console.log('[INACTIVITY] Timeout de 3 minutos alcanzado - Redirigiendo...');
        this.handleInactivity();
      }, this.INACTIVITY_TIME);
    } else {
      // Modo con reseteo por actividad del usuario
      this.resetTimer();
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, this.boundResetTimer, true);
      });
      console.log('[INACTIVITY] Monitoreo de inactividad iniciado (3 minutos con reseteo)');
    }
  }

  /**
   * Detener el temporizador de inactividad
   */
  stopWatching(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.clearTimer();

    // Remover los event listeners solo si no es timeout fijo
    if (!this.fixedTimeout) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.removeEventListener(event, this.boundResetTimer, true);
      });
    }

    this.fixedTimeout = false;
    console.log('[INACTIVITY] Monitoreo de inactividad detenido');
  }

  /**
   * Resetear el temporizador
   */
  private resetTimer(): void {
    this.clearTimer();

    this.inactivityTimer = setTimeout(() => {
      console.log('[INACTIVITY] Usuario inactivo por 3 minutos - Redirigiendo...');
      this.handleInactivity();
    }, this.INACTIVITY_TIME);
  }

  /**
   * Limpiar el temporizador
   */
  private clearTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Manejar la inactividad - cerrar sesión y redirigir al usuario
   */
  private handleInactivity(): void {
    this.stopWatching();

    // Obtener información de la sesión
    const sessionType = localStorage.getItem('sessionType');
    const sessionId = localStorage.getItem('sessionId');
    const mesaCode = this.extractMesaCode(sessionId);

    console.log('[INACTIVITY] Cerrando sesión por inactividad - Tipo:', sessionType);

    if (sessionType === 'cliente' && sessionId) {
      // Cerrar sesión de cliente registrado
      this.http.delete(`${this.sesionesUrl}/${sessionId}`).subscribe(
        () => {
          console.log('[INACTIVITY] Sesión de cliente cerrada:', sessionId);
          this.cleanupAndRedirect();
        },
        (error) => {
          console.error('[INACTIVITY] Error al cerrar sesión de cliente:', error);
          this.cleanupAndRedirect();
        }
      );
    } else if (mesaCode) {
      // Eliminar mesa de active-tables (usuario anónimo)
      this.http.delete(`${this.apiUrl}/${mesaCode}`).subscribe(
        () => {
          console.log('[INACTIVITY] Mesa eliminada del array:', mesaCode);
          this.cleanupAndRedirect();
        },
        (error) => {
          console.error('[INACTIVITY] Error al eliminar mesa:', error);
          this.cleanupAndRedirect();
        }
      );
    } else {
      this.cleanupAndRedirect();
    }
  }

  /**
   * Limpiar localStorage y redirigir
   */
  private cleanupAndRedirect(): void {
    // Limpiar datos de sesión
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionType');

    // Marcar bloqueo temporal en la pestaña para impedir acceso con botón atrás
    sessionStorage.setItem('inactivityRedirect', '1');
    localStorage.setItem('inactivityRedirect', '1');

    // Mostrar alerta y redirigir
    alert('Por inactividad, serás redirigido.');
    window.location.replace(this.redirectUrl);
  }

  /**
   * Extraer código de mesa del sessionId
   */
  private extractMesaCode(sessionId: string | null): string | null {
    if (!sessionId) return null;
    const parts = sessionId.split('_');
    return parts[0] || null;
  }

  /**
   * Establecer URL de redirección personalizada
   */
  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  /**
   * Verificar si el servicio está activo
   */
  isWatching(): boolean {
    return this.isActive;
  }
}
