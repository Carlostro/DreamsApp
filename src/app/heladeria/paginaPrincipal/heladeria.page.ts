import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AppExitService } from '../../services/app-exit.service';
import { InactivityService } from '../../services/inactivity.service';
import { TardeoService } from '../../tardeo/tardeo.service';
import { TardeoProduct } from '../../tardeo/tardeo.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-heladeria',
  templateUrl: './heladeria.page.html',
  styleUrls: ['./heladeria.page.scss'],
})
export class HeladeriaPage implements OnInit, OnDestroy {
  code: string | null = null;
  timestamp: string | null = null;
  promosRoute: string | null = null;
  productRoute: string | null = null;
  promoPuntosRoute: string | null = null;
  misPedidosRoute: string | null = null;
  isRegisteredUser: boolean = false;
  productoTardeo: TardeoProduct | null = null;
  mostrarPopupTardeo = false;

  constructor(
    private route: ActivatedRoute,
    private appExitService: AppExitService,
    private inactivityService: InactivityService,
    private tardeoService: TardeoService,
    private orderService: OrderService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    // Verificar si el usuario está registrado
    const sessionType = localStorage.getItem('sessionType');
    this.isRegisteredUser = sessionType === 'cliente';

    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp'); // Obtener el timestamp de los parámetros de la ruta

      console.log('timestamp', this.timestamp);
      console.log('code', this.code);
      console.log('Usuario registrado:', this.isRegisteredUser);

      if (this.code && this.timestamp) {
        this.promosRoute = `/${this.timestamp}/${this.code}/promos-heladeria`;
        this.productRoute = `/${this.timestamp}/${this.code}/product-heladeria`;
        this.promoPuntosRoute = `/${this.timestamp}/${this.code}/promo-puntos`;
        this.misPedidosRoute = `/${this.timestamp}/${this.code}/mis-pedidos`;

        // Inicializar el servicio con el número de mesa
        this.appExitService.initialize(this.code);

        this.cargarTardeoActivo();
      }
    });
  }

  cargarTardeoActivo() {
    this.tardeoService.getTardeoActivo().subscribe({
      next: (producto) => {
        this.productoTardeo = producto;
        this.mostrarPopupTardeo = !!producto;
      },
      error: (error) => {
        console.error('No se pudo cargar el tardeo activo', error);
        this.mostrarPopupTardeo = false;
      }
    });
  }

  cerrarPopupTardeo() {
    this.mostrarPopupTardeo = false;
  }

  async pedirTardeo() {
    if (this.productoTardeo) {
      this.orderService.addProduct({
        Id: Number(this.productoTardeo.Id) || 0,
        Nombre: this.productoTardeo.Nombre,
        Precio: this.productoTardeo.Precio,
        Cantidad: 1,
        Imagen: this.productoTardeo.Imagen,
        Descripcion: this.productoTardeo.Descripcion,
        Ncomplementos: 0,
        Complementos: [],
        PrecioTotal: this.productoTardeo.Precio,
        Activo: 1,
        ComplementoActivo: 0
      });
    }
    this.cerrarPopupTardeo();
    const toast = await this.toastCtrl.create({
      message: '¡Producto añadido al pedido correctamente!',
      duration: 2500,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }
}
