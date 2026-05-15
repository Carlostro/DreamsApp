import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pedido-enviado',
  templateUrl: './pedido-enviado.component.html',
  styleUrls: ['./pedido-enviado.component.scss'],
})
export class PedidoEnviadoComponent implements OnInit, OnDestroy {
  code: string = '';
  timestamp: string | null = null;
  private apiUrl = `${environment.apiUrl}/active-tables`;
  private sesionesUrl = `${environment.apiUrl}/sesiones-clientes`;

  esUsuarioRegistrado: boolean = false;
  puntosGanados: number | null = null;
  puntosPotenciales: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    // Suscribirse a los parámetros de la ruta para obtener el código y el timestamp
    this.route.params.subscribe(params => {
      this.code = params['code']; // Asegúrate de que el parámetro se llama 'code'
      this.timestamp = params['timestamp'];
    });
    // Comprobar si el usuario es registrado
    this.esUsuarioRegistrado = localStorage.getItem('sessionType') === 'cliente';
    const puntos = localStorage.getItem('puntosGanadosUltimoPedido');
    this.puntosGanados = puntos ? parseInt(puntos, 10) : null;
    // Si no es usuario registrado, calculamos los puntos potenciales
    if (!this.esUsuarioRegistrado) {
      // Intentar obtener el total del pedido del último pedido
      let total = localStorage.getItem('ultimoTotalPedido');
      if (total) {
        this.puntosPotenciales = Math.floor(parseFloat(total));
      } else {
        // Si no está en localStorage, intentar usar puntosGanados si existe
        this.puntosPotenciales = this.puntosGanados;
      }
    }
    // Limpiar el valor para que no se muestre en futuros pedidos
    localStorage.removeItem('puntosGanadosUltimoPedido');
    localStorage.removeItem('ultimoTotalPedido');
  }

  ngOnInit() {
    // Liberar la mesa (anónima o registrada)
    this.liberarMesa();
    // Marcar sesión cerrada por fin de pedido para bloquear navegación atrás
    sessionStorage.setItem('sessionClosedRedirect', '1');
    // Redirigir después de 3 segundos
    setTimeout(() => {
      window.location.replace("https://www.instagram.com/dreamsalzira");
    }, 5000);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    // Usar sendBeacon/fetch keepalive para garantizar envío
    this.liberarMesaConBeacon();
  }

  ngOnDestroy() {
    // Liberar la mesa cuando el componente se destruya
    this.liberarMesa();
  }

  // Liberar mesa según tipo de sesión
  private liberarMesa(): void {
    const sessionType = localStorage.getItem('sessionType');
    const sessionId = localStorage.getItem('sessionId');

    if (sessionType === 'cliente' && sessionId) {
      // Cerrar sesión de cliente registrado
      this.http.delete(`${this.sesionesUrl}/${sessionId}`).subscribe(
        () => console.log('[PEDIDO-ENVIADO] Sesión cliente cerrada:', sessionId),
        (error) => console.error('[PEDIDO-ENVIADO] Error al cerrar sesión:', error)
      );
    } else {
      // Eliminar mesa anónima
      this.http.delete(`${this.apiUrl}/${this.code}`).subscribe(
        () => console.log('[PEDIDO-ENVIADO] Mesa anónima liberada:', this.code),
        (error) => console.error('[PEDIDO-ENVIADO] Error al liberar mesa:', error)
      );
    }

    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionType');
  }

  // Liberar con sendBeacon/fetch keepalive (para beforeunload)
  private liberarMesaConBeacon(): void {
    const sessionType = localStorage.getItem('sessionType');
    const sessionId = localStorage.getItem('sessionId');

    if (sessionType === 'cliente' && sessionId) {
      const url = `${environment.apiUrl}/sesiones-clientes/close`;
      const blob = new Blob([JSON.stringify({ sessionId })], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      // Usar fetch keepalive para anónimos
      try {
        fetch(`${this.apiUrl}/${this.code}`, {
          method: 'DELETE',
          keepalive: true
        });
      } catch (error) {
        console.error('[PEDIDO-ENVIADO] Error fetch keepalive:', error);
      }
    }

    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionType');
  }
}
