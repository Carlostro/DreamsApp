import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model'; // Importar la interfaz Product
import { ActivatedRoute, Router } from '@angular/router';
import { InactivityService } from '../../services/inactivity.service';
import { AppExitService } from '../../services/app-exit.service';

@Component({
  selector: 'app-promos-heladeria',
  templateUrl: './promos-heladeria.page.html',
  styleUrls: ['./promos-heladeria.page.scss'],
})
export class PromosHeladeriaPage implements OnInit, OnDestroy {
  data: Product[] = [];
  cartItems = 0;
  pageTitle: string = 'Promociones';
  code: string | null = null; // Código de la mesa
  timestamp: string | null = null; // Timestamp
  promos: Product[] = [];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private inactivityService: InactivityService,
    private appExitService: AppExitService
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

    // Cargar las promociones al inicializar el componente
    this.loadPromos();

    // Actualizar el número de elementos en el carrito
    this.updateCartItems();
  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  loadPromos(): void {
    console.log(`Fetching promotions from URL: ${this.orderService.apiUrl}/promosheladeria/active`);
    this.orderService.getPromotions().subscribe(promotions => {
      this.promos = promotions.filter(promo => promo.Activo === 1);
    });
  }

  incrementQuantity(item: Product): void {
    item.Cantidad = (item.Cantidad || 0) + 1;
    this.orderService.addProduct(item);
    //this.updateCartItems();
  }

  updateCartItems(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.cartItems = orderList.reduce((total, product) => total + (product.Cantidad || 0), 0);
    });
  }
}
