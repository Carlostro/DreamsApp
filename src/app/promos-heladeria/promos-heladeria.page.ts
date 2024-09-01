import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Product } from '../models/product.model'; // Importar la interfaz Product
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-promos-heladeria',
  templateUrl: './promos-heladeria.page.html',
  styleUrls: ['./promos-heladeria.page.scss'],
})
export class PromosHeladeriaPage implements OnInit {
  data: Product[] = [];
  cartItems = 0;
  pageTitle: string = 'Promociones';
  code: string | null = null; // Código de la mesa
  timestamp: string | null = null; // Timestamp
  promos: Product[] = [];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp');
    });

    // Cargar las promociones al inicializar el componente
    this.loadPromos();

    // Actualizar el número de elementos en el carrito
    this.updateCartItems();
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
