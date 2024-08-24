import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from './../services/order.service';
import { ComplementoService } from './../services/complemento.service';
import { Product } from './../models/product.model';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product: Product | undefined;
  tableName: string | null = null;
  code: string | null = null; // Añadir la propiedad code
  cartItems: number = 0;
  complementos: any[] = [];
  selectedComplementos: any[] = [];
  Ncomplementos: number = 0;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private complementoService: ComplementoService,
    private location: Location,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code');
    this.tableName = this.route.snapshot.paramMap.get('table');
    const productId = this.route.snapshot.paramMap.get('id');
    if (this.tableName && productId) {
      this.orderService.getProductById(this.tableName, productId).subscribe(product => {
        this.product = product;

        // Si la tabla actual corresponde a uno de estos productos cargamos sus complementos
        if (this.tableName === 'Cubatas' || this.tableName === 'Helados Personalizados') {
          this.loadComplementos(this.tableName);
          console.log('Nombre del producto:', this.product.Nombre);
          this.loadNcomplementos(this.tableName, this.product.Nombre);
          console.log('Cargando complementos');
        } else if (this.tableName === 'Cafes'|| this.tableName === 'Bolleria') {
          this.loadComplementos(this.tableName);
          console.log('Nombre del producto:', this.product.Nombre);
        }
      });
    }
    this.updateCartItems();
  }

  // Cargamos los complementos de la tabla seleccionada
  loadComplementos(tableName: string): void {
    this.complementoService.getComplementos(tableName).subscribe(data => {
      this.complementos = data;
    });
  }

  // Cargamos el número de complementos de la tabla seleccionada
  loadNcomplementos(tableName: string, productName: string): void {
    this.complementoService.getNcomplementos(tableName, productName).subscribe(data => {
      this.Ncomplementos = data.Ncomplementos;
    });
  }

  // Gestión de los complementos seleccionados
  selectComplemento(complemento: any): void {
    if (this.tableName === 'Cubatas') {
      // Si la tabla es 'Cubatas', solo se puede seleccionar un complemento
      this.selectedComplementos = [complemento];
    } else if (this.tableName === 'Helados Personalizados') {
      const maxComplementos = this.Ncomplementos; // Número máximo de complementos permitidos
      const index = this.selectedComplementos.indexOf(complemento);
      if (index === -1) {
        if (this.selectedComplementos.length < maxComplementos) {
          this.selectedComplementos.push(complemento);
        }
      } else {
        this.selectedComplementos.splice(index, 1);
      }
    } else {
      const index = this.selectedComplementos.indexOf(complemento);
      if (index === -1) {
        this.selectedComplementos.push(complemento);
      } else {
        this.selectedComplementos.splice(index, 1);
      }
    }
  }

  // Comprobar si un complemento está seleccionado
  isComplementoSelected(complemento: any): boolean {
    return this.selectedComplementos.indexOf(complemento) !== -1;
  }

  // Añadir producto al pedido
  async addToOrder(): Promise<void> {
    if (this.selectedComplementos.length < this.Ncomplementos) {
      const alert = await this.alertController.create({
        header: 'Faltan Complementos',
        message: `Por favor, selecciona todos los complementos disponibles (${this.Ncomplementos}) antes de añadir el producto al pedido.`,
        buttons: ['OK']
      });
      await alert.present();
    } else {
      this.incrementQuantity();
    }
  }

  // Incrementar la cantidad de un producto
  incrementQuantity(): void {
    if (this.product) {
      let totalPrice = this.product.Precio;

      if (this.tableName === 'Cafes' || this.tableName === 'Bolleria') {
        this.selectedComplementos.forEach(complemento => {
          totalPrice += complemento.Precio;
        });
      }

      this.product.Cantidad = (this.product.Cantidad || 0) + 1;
      this.product.Complementos = this.selectedComplementos;
      this.product.PrecioTotal = totalPrice; // Añadir el precio total al producto

      this.orderService.addProduct(this.product);
      this.updateCartItems(); // Actualizar el número de elementos en el carrito después de añadir un producto
      this.selectedComplementos = []; // Resetear los complementos seleccionados
    }
  }

  // Actualizar el número de elementos en el carrito
  updateCartItems(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.cartItems = orderList.reduce((total, product) => total + (product.Cantidad || 0), 0);
    });
  }

  // Volver a la página anterior
  goBack() {
    this.location.back();
  }
}
