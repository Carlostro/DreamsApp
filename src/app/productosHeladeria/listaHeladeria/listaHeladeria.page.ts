import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model'; // Importar la interfaz Product
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-listaheladeria',
  templateUrl: './listaHeladeria.page.html',
  styleUrls: ['./listaHeladeria.page.scss'],
})
export class ListaHeladeriaPage implements OnInit {
  data: Product[] = [];
  cartItems = 0;
  pageTitle: string = '';
  code: string | null = null; // Código de la mesa
  timestamp: string | null = null; // Timestamp
  allowedTablesForDetails: string[] = ['Cubatas','Helados Personalizados',
    'Cafes','Bolleria','Ginebras','Batidos Helados','Infusiones']; // Lista de tablas permitidas
  selectedTable: string = '';

  constructor(
    private orderService: OrderService,
     private route: ActivatedRoute,
     private router: Router) {}

  ngOnInit() {
      // Suscríbete a los cambios en los parámetros de la ruta
      this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp');
      });

    // Recuperar el nombre del producto del almacenamiento local
    const storedProductName = localStorage.getItem('selectedProduct');
    this.pageTitle = storedProductName ? storedProductName : 'Producto Desconocido';

    // Actualizar el título basado en la ruta
    this.route.params.subscribe(params => {
      if (params['title']) {
        this.pageTitle = params['title'];
        this.selectedTable = this.pageTitle;
        this.fetchProductsByTitle(this.pageTitle);
      }
    });

    // Actualizar el número de elementos en el carrito
    this.updateCartItems();
  }

  fetchProductsByTitle(title: string): void {
    console.log(`Fetching products from URL: ${this.orderService.apiUrl}/data/name/${title}`);
    this.orderService.getProductsByTitle(title).subscribe(products => {
      this.data = products;
    });
  }

  incrementQuantity(item: Product): void {
    item.Cantidad = (item.Cantidad || 0) + 1;
    this.orderService.addProduct(item);

  }

  updateCartItems(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.cartItems = orderList.reduce((total, product) => total + (product.Cantidad || 0), 0);
    });
  }

    // Método para verificar si la tabla está permitida
    isTableAllowedForDetails(): boolean {
      return this.allowedTablesForDetails.includes(this.selectedTable);
    }


  viewProductDetail(item: Product): void {
    if (this.isTableAllowedForDetails()) {
      this.router.navigate([`/${this.timestamp}/${this.code}/product-detail`, this.pageTitle, item.Id]);
    }
}
}
