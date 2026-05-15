import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../services/clientes.service';
import { AlertController } from '@ionic/angular';
import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-promo-puntos',
  templateUrl: './promo-puntos.page.html',
  styleUrls: ['./promo-puntos.page.scss'],
})
export class PromoPuntosPage implements OnInit, OnDestroy {

    private beforeUnloadHandler = () => {
      // No liberar mesa ni sesión si estamos en loading o pedido-enviado
      const currentUrl = window.location.href;
      if (!/loading|pedido-enviado/.test(currentUrl) && this.code) {
        this.orderService.releaseTable(this.code);
      }
    };
  promosPuntos: Product[] = [];
  cartItems = 0;
  code: string | null = null;
  timestamp: string | null = null;
  puntosDisponibles: number = 0;
  clienteId: number | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private alertController: AlertController,
    private inactivityService: InactivityService,
  ) {}

  ngOnInit() {
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    // Iniciar control de inactividad (con reseteo por actividad)
    this.inactivityService.startWatching();

    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp');
    });


    // Obtener ID del cliente desde localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.clienteId = parseInt(userId);
      this.cargarPuntosCliente();
    }

    this.loadPromosPuntos();
    this.updateCartItems();
  }

  ngOnDestroy() {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  cargarPuntosCliente(): void {
    if (this.clienteId) {
      this.clientesService.obtenerPuntosCliente(this.clienteId).subscribe(
        (response) => {
          if (response.success && response.puntos) {
            this.puntosDisponibles = response.puntos.puntos_totales || 0;
            console.log('Puntos disponibles:', this.puntosDisponibles);
          }
        },
        (error) => {
          console.error('Error al cargar puntos:', error);
        }
      );
    }
  }

  loadPromosPuntos(): void {
    console.log(`Cargando promos de puntos desde: ${this.orderService.apiUrl}/promospuntos/active`);
    this.orderService.getPromosPuntos().subscribe(promos => {
      this.promosPuntos = promos.filter(promo => promo.Activo === 1);
    });
  }

  async canjearPuntos(item: Product): Promise<void> {
    const puntosNecesarios = item.PuntosNecesarios || 0;

    // Verificar si tiene suficientes puntos
    if (this.puntosDisponibles < puntosNecesarios) {
      await this.showAlert(
        'Puntos Insuficientes',
        `Necesitas ${puntosNecesarios} puntos pero solo tienes ${this.puntosDisponibles}.`
      );
      return;
    }

    // Confirmar canje
    const confirmar = await this.confirmarCanje(item.Nombre, puntosNecesarios);
    if (!confirmar) {
      return;
    }

    // Agregar producto al pedido con precio 0
    const productoConPrecio0 = {
      ...item,
      Precio: 0, // Precio en 0 porque es canje por puntos
      PrecioOriginal: item.Precio, // Guardar precio original por referencia
      EsCanjeoPuntos: true, // Marcar que es un canje
      Cantidad: 1
    };

    this.orderService.addProduct(productoConPrecio0);

    // Guardar el canje pendiente en localStorage para descontar después
    this.guardarCanjePendiente(item.Id, puntosNecesarios, item.Nombre);

    // Actualizar puntos disponibles localmente (se descontarán realmente al finalizar pedido)
    this.puntosDisponibles -= puntosNecesarios;

    await this.showAlert(
      'Producto Añadido',
      `${item.Nombre} ha sido añadido a tu pedido. Los puntos se descontarán al finalizar.`
    );

    this.updateCartItems();
  }

  guardarCanjePendiente(productoId: number, puntos: number, nombre: string): void {
    // Obtener canjes pendientes del localStorage
    const canjesStr = localStorage.getItem('canjesPendientes');
    const canjes = canjesStr ? JSON.parse(canjesStr) : [];

    canjes.push({
      productoId: productoId,
      puntos: puntos,
      nombre: nombre,
      fecha: new Date().toISOString()
    });

    localStorage.setItem('canjesPendientes', JSON.stringify(canjes));
  }

  async confirmarCanje(nombreProducto: string, puntos: number): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Confirmar Canje',
        message: `¿Deseas canjear ${puntos} puntos por ${nombreProducto}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Confirmar',
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (header === 'Sesión expirada') {
              window.location.href = 'https://www.instagram.com/dreamsalzira';
            }
          }
        }
      ]
    });
    await alert.present();
  }

  updateCartItems(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.cartItems = orderList.reduce((total, product) => total + (product.Cantidad || 0), 0);
    });
  }

  trackByFn(index: number, item: Product): any {
    return item.Id || index;
  }
}
