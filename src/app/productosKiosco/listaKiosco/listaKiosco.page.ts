import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model'; // Importar la interfaz Product
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listakiosco',
  templateUrl: './listaKiosco.page.html',
  styleUrls: ['./listaKiosco.page.scss'],
})
export class ListaKioscoPage implements OnInit {

  data: Product[] = [];
  cartItems = 0;
  pageTitle: string = '';

  constructor(private orderService: OrderService, private route: ActivatedRoute) {}

  ngOnInit() {
    // Recuperar el nombre del producto del almacenamiento local
    const storedProductName = localStorage.getItem('selectedProduct');
    this.pageTitle = storedProductName ? storedProductName : 'Producto Desconocido';

    // Actualizar el título basado en la ruta
    this.route.params.subscribe(params => {
      if (params['title']) {
        this.pageTitle = params['title'];
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
    //this.updateCartItems();
  }

  updateCartItems(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.cartItems = orderList.reduce((total, product) => total + (product.Cantidad || 0), 0);
    });
  }
}

