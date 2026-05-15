import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppExitService {
  private mesaNumero: string | null = null;
  private isInitialized: boolean = false;

  constructor(private http: HttpClient) {}

  initialize(mesaNumero: string): void {
    if (this.isInitialized) {
      this.destroy();
    }

    this.mesaNumero = mesaNumero;

    // Detectar segundo plano
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.isInitialized = true;
  }

  destroy(): void {
    if (!this.isInitialized) return;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.mesaNumero = null;
    this.isInitialized = false;
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.closeSession();
    }
  }

  private closeSession(): void {
    if (!this.mesaNumero) return;

    const sessionType = localStorage.getItem('sessionType');
    const sessionId = localStorage.getItem('sessionId');

    console.log('[APP-EXIT] Página en segundo plano - Mesa:', this.mesaNumero, 'Tipo:', sessionType);

    if (sessionType === 'cliente' && sessionId) {
      const url = `${environment.apiUrl}/sesiones-clientes/close`;
      const blob = new Blob([JSON.stringify({ sessionId })], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      const url = `${environment.apiUrl}/active-tables/remove`;
      const blob = new Blob([JSON.stringify({ code: this.mesaNumero })], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    }
  }
}