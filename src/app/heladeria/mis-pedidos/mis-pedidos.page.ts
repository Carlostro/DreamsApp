import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { TicketsService } from '../../services/tickets.service';
import { OrderService } from '../../services/order.service';
import { InactivityService } from '../../services/inactivity.service';

interface TicketHistorial {
  id: number;
  pedidoId: string;
  detalles: string;
  total: number;
  fecha: string;
  productos?: any[];
}

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit, OnDestroy {
  private readonly ACCESS_EXPIRATION_MS = 5 * 60 * 1000;
  pedidos: TicketHistorial[] = [];
  code: string = '';
  timestamp: string = '';
  loading: boolean = true;
  isAccessContextValid: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketsService: TicketsService,
    private orderService: OrderService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private inactivityService: InactivityService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.timestamp = params.get('timestamp') || '';
      this.code = params.get('code') || '';
      this.validateAccessContext();
    });

    this.inactivityService.startWatching();
    this.cargarHistorial();
  }

  ngOnDestroy() {
    this.inactivityService.stopWatching();
  }

  cargarHistorial() {
    const clienteId = localStorage.getItem('userId');

    if (!clienteId) {
      this.showAlert('Error', 'Debes iniciar sesión para ver tu historial');
      this.router.navigate([`/${this.code}/loading`]);
      return;
    }

    this.loading = true;
    this.ticketsService.getHistorialCliente(parseInt(clienteId)).subscribe(
      (response) => {
        if (response.success && response.tickets) {
          this.pedidos = response.tickets.map((ticket: TicketHistorial) => {
            // Parsear el JSON de detalles
            try {
              ticket.productos = JSON.parse(ticket.detalles);
            } catch (e) {
              ticket.productos = [];
            }
            return ticket;
          });
        } else {
          this.pedidos = []; // Si no hay tickets, lista vacía
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar historial:', error);
        // No mostrar error si simplemente no hay pedidos
        this.pedidos = [];
        this.loading = false;
      }
    );
  }

  async volverAPedir(pedido: TicketHistorial) {
    if (!this.isAccessContextValid) {
      await this.showAlert(
        'Acceso no válido',
        'La sesión de acceso ha caducado o se ha detectado una URL modificada. Debes volver a escanear el código QR para continuar.'
      );
      return;
    }

    // Verificar si el pedido tiene productos con precio 0 (canjes)
    const tieneCanjes = pedido.productos?.some(p => p.precioUnitario === 0);
    const mensaje = tieneCanjes
      ? '⚠️ Este pedido incluye productos canjeados. Al repetirlo, se cargarán con su precio original, no como canje.\n\n¿Deseas continuar?'
      : '¿Deseas agregar todos los productos de este pedido a tu carrito actual?';

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: mensaje,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, agregar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Agregando productos...'
            });
            await loading.present();

            // Agregar cada producto del pedido al carrito
            if (pedido.productos && pedido.productos.length > 0) {
              pedido.productos.forEach(producto => {
                for (let i = 0; i < producto.cantidad; i++) {
                  const productoParaCarrito: any = {
                    Id: 0,
                    Nombre: producto.nombre,
                    Precio: producto.precioUnitario,
                    Cantidad: 1,
                    Imagen: '',
                    Descripcion: '',
                    Ncomplementos: producto.complementos?.length || 0,
                    PrecioTotal: producto.precioUnitario,
                    Activo: 1,
                    ComplementoActivo: 1,
                    Complementos: producto.complementos?.map((comp: any) => ({
                      Nombre: comp.nombre,
                      Precio: comp.precio
                    })) || []
                  };
                  this.orderService.addProduct(productoParaCarrito);
                }
              });

              await loading.dismiss();
              await this.showAlert(
                'Productos Agregados',
                `Se han agregado ${pedido.productos.length} productos a tu carrito`
              );

              // Navegar a la lista de pedidos
              this.router.navigate([`/${this.timestamp}/${this.code}/lista-pedido`]);
            } else {
              await loading.dismiss();
              await this.showAlert('Error', 'Este pedido no tiene productos');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  formatearFecha(fecha: string): string { 
    const date = new Date(fecha);

    // Sumar 1 hora
    //date.setHours(date.getHours() + 1);

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  tieneCanjes(pedido: TicketHistorial): boolean {
    return pedido.productos?.some(p => p.precioUnitario === 0) || false;
  }

  volver() {
    this.router.navigate([`/${this.timestamp}/${this.code}/heladeria`]);
  }

  async showAlert(header: string, message: string) {
    // Si es expiración, aplicar estilo especial
    let customMessage = message;
    if (header === 'Sesión expirada' || header === 'Acceso no válido') {
      customMessage = `<span style="font-size:2em;color:#d32f2f;font-weight:bold;">${message}</span>`;
    }
    const alert = await this.alertController.create({
      header,
      message: customMessage,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (header === 'Sesión expirada') {
              window.location.href = 'https://www.instagram.com/dreamsalzira';
            }
          }
        }
      ],
      // Permitir HTML en el mensaje
      cssClass: 'custom-alert-message'
    });
    await alert.present();
  }

  private async validateAccessContext(): Promise<void> {
    const expectedCode = this.getExpectedMesaCode();
    const isCodeValid = !!this.code && !!expectedCode && this.code === expectedCode;

    const timestampMs = this.timestamp ? this.decodeRouteTimestamp(this.timestamp) : null;
    const isTimestampValid = timestampMs !== null && Date.now() - timestampMs <= this.ACCESS_EXPIRATION_MS;

    const isValid = isCodeValid && isTimestampValid;
    const changed = this.isAccessContextValid !== isValid;
    this.isAccessContextValid = isValid;

    if (!isValid && changed) {
      await this.showAlert(
        'Acceso no válido',
        'La sesión de acceso ha caducado o se ha detectado una URL modificada. Debes volver a escanear el código QR para continuar.'
      );
    }
  }

  private getExpectedMesaCode(): string | null {
    const guardCode = localStorage.getItem('codigoMesaGuardado');
    if (guardCode) {
      return guardCode;
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      return null;
    }

    const parts = sessionId.split('_');
    return parts.length > 0 ? parts[0] : null;
  }

  private decodeRouteTimestamp(encodedTimestamp: string): number | null {
    try {
      const padded = encodedTimestamp + '='.repeat((4 - (encodedTimestamp.length % 4)) % 4);
      const decoded = atob(padded);
      const isoMatch = decoded.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      if (!isoMatch) {
        return null;
      }

      const timeMs = Date.parse(isoMatch[0]);
      return Number.isNaN(timeMs) ? null : timeMs;
    } catch {
      return null;
    }
  }
}
