import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
// import ConectorPluginV3 from '../ConectorPluginV3';

// const conector = new ConectorPluginV3();

@Component({
  selector: 'app-lista-pedido',
  templateUrl: './lista-pedido.page.html',
  styleUrls: ['./lista-pedido.page.scss'],

})
export class ListaPedidoPage implements OnInit {
  orderList: Product[] = [];
  totalCost: number = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrderList();
  }

  loadOrderList(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.orderList = orderList;
      this.calculateTotalCost();
    });
  }

  calculateTotalCost(): void {
    this.totalCost = this.orderList.reduce((total, product) => total + (product.Cantidad * product.Precio), 0);
  }

  incrementQuantity(product: Product): void {
    this.orderService.addProduct(product);
    this.loadOrderList();
  }

  decrementQuantity(product: Product): void {
    if (product.Cantidad > 1) {
      product.Cantidad -= 1;
      this.orderService.updateProductQuantity(product);
    } else {
      this.orderService.removeProduct(product);
    }
    this.loadOrderList();
  }
  printOrder() {
      const printContent = this.generatePrintContent();
      fetch('http://<192.168.1.41>:3000/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: printContent // Cambia esto por el contenido que quieras imprimir
        })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  }
  generatePrintContent(): string {
    let content = `
      <html>
      <head>

        <style>
          body { font-family: Arial, sans-serif; }
          .product { margin-bottom: 10px; }
          .product-name { font-weight: bold; }
          .product-details { margin-left: 20px; }
          .total-cost { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
          .h2 { font-size: 1.5em; font-weight: bold; margin: 0; padding: 0; text-align: right; }
        </style>
      </head>
      <body>
        <h2 class="h2">Lista de Pedido</h2>
    `;

    this.orderList.forEach(product => {
      content += `
        <div class="product">
          <div class="product-name">${product.Cantidad} x ${product.Nombre}</div>
          <div class="product-details">
            <span>Precio: ${product.Precio.toFixed(2)} €</span>
            <span style="float: right; font-size: 1.2em; font-weight: bold;">${(product.Precio * product.Cantidad).toFixed(2)} €</span>
          </div>
        </div>
      `;
    });

    content += `
      <h2 style="text-align: right; font-size: 1.5em; font-weight: bold;">Total: ${this.totalCost.toFixed(2)} €</h2>
    </body>
    </html>
    `;

    return content;
  }
}
