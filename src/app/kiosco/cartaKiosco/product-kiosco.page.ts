import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router,NavigationEnd } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AppExitService } from '../../services/app-exit.service';
import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-product-kiosco',
  templateUrl: './product-kiosco.page.html',
  styleUrls: ['./product-kiosco.page.scss'],
})
export class ProductKioscoPage implements OnInit, OnDestroy {
  pageTitle: string = '';
  cartItems = 0;
  code: string | null = null;
  timestamp: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private appExitService: AppExitService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    this.timestamp = params.get('timestamp');
   });

    // Inicializar AppExitService con el código de mesa
    if (this.code) {
      this.appExitService.initialize(this.code);
    }
    //Añadimos esta funcion para que actualize el cartItems y
    //poder ver el boton en la pagina de productos cuando tengamos
    //algun producto en la lista
    this.updateCartItems();


    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });
    this.updateTitle();


  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  updateTitle() {
    const currentRoute = this.route.snapshot.firstChild?.routeConfig?.path;
    const routeTitleMap: { [key: string]: string } = {
      'snacks': 'Snacks',
      'chuches': 'Chuches',
      'revistas': 'Revistas',
      'prensa': 'Prensa',
      'recargas': 'Recargas',
      'meriendas': 'Meriendas',
      'cromos': 'Cromos',
      'caramelos': 'Caramelos',
      'juguetes': 'Juguetes',
      'impresion3d': 'Impresion 3D',
      'bebidas': 'Bebidas',

    };

    if (currentRoute !== undefined) {
      this.pageTitle = routeTitleMap[currentRoute] || 'Carta de Productos';
      if (currentRoute === 'snacks') {
        console.log('Snacks');
      }
    } else {
      this.pageTitle = 'Carta de Productos';
    }

  }
  updateCartItems(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.cartItems = orderList.reduce((total, product) => total + (product.Cantidad || 0), 0);
    });
  }
}
