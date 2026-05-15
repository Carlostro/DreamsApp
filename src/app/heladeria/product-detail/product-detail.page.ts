import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ComplementoService } from '../../services/complemento.service';
import { Product } from '../../models/product.model';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { InactivityService } from '../../services/inactivity.service';
import { AppExitService } from '../../services/app-exit.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  product: Product | undefined;
  tableName: string | null = null;
  code: string | null = null; // Añadir la propiedad code
  timestamp: string | null = null;
  cartItems: number = 0;
  complementos: any[] = [];
  selectedComplementos: any[] = [];
  Ncomplementos: number = 0;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private complementoService: ComplementoService,
    private location: Location,
    private alertController: AlertController,
    private inactivityService: InactivityService,
    private appExitService: AppExitService,
    private router: Router
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    this.code = this.route.snapshot.paramMap.get('code');
    this.timestamp = this.route.snapshot.paramMap.get('timestamp');
    this.tableName = this.route.snapshot.paramMap.get('table');

    // Inicializar AppExitService con el código de mesa
    if (this.code) {
      this.appExitService.initialize(this.code);
    }
    const productId = this.route.snapshot.paramMap.get('id');
    if (this.tableName && productId) {
      this.orderService.getProductById(this.tableName, productId).subscribe(product => {
        this.product = product;

        // Si la tabla actual corresponde a uno de estos productos cargamos sus complementos
        //Estas tablas tienen limitacion en la seleccion de complementos referenciados enuna caloumna de la tabla
        if (this.tableName === 'Helados Personalizados'||this.tableName === 'Bolleria'|| this.tableName === 'Batidos Helados') {

          this.loadComplementos(this.tableName);
          this.loadNcomplementos(this.tableName, this.product.Nombre);


        } //Para esta tablas solo se cargan los complementos
        else if (this.tableName === 'Cafes' || this.tableName === 'Cubatas'
          || this.tableName === 'Ginebras' || this.tableName === 'Infusiones'|| this.tableName === 'Refrescos'
          || this.tableName === 'Tostadas') {
          this.loadComplementos(this.tableName);

        }
      });
    }
    // Actualizar el número de elementos en el carrito
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
    //En la tabla de Cubatas y Ginebras solo se puede seleccionar un complemento
    if (this.tableName === 'Cubatas'  || this.tableName === 'Ginebras') {
        this.selectedComplementos = [complemento];
    }
  // En estas tablas el límite de complementos es el que se ha cargado en la tabla
  else if (this.tableName === 'Helados Personalizados' || this.tableName === 'Bolleria' || this.tableName === 'Batidos Helados') {
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
  isComplementoDisabled(complemento: any): boolean {
    if (this.tableName === 'Helados Personalizados' || this.tableName === 'Bolleria'|| this.tableName === 'Batidos Helados') {
        return this.selectedComplementos.length >= this.Ncomplementos && !this.isComplementoSelected(complemento);
    }
    return false;
  }

  // Añadir producto al pedido
  async addToOrder(): Promise<void> {
    if ((this.tableName === "Cubatas" || this.tableName === "Ginebras")
          && this.selectedComplementos.length === 0) {
      const alert = await this.alertController.create({
        header: 'Elige una Bebida',
        message: `Por favor, selecciona una Bebida antes de añadir el producto al pedido.`,
        buttons: ['OK']
      });
      await alert.present();
    }
    else if (this.selectedComplementos.length < 1 &&
      (this.tableName === 'Helados Personalizados'|| this.tableName === 'Cubatas') ){
      const alert = await this.alertController.create({
        header: 'Faltan Complementos',
        message: `Por favor, seleccciona al menos 1 complemento antes de añadir el producto al pedido.`,
        buttons: ['OK']
      });
      await alert.present();
    } else {
      this.incrementQuantity();
      this.goBack();
    }
  }

  // Incrementar la cantidad de un producto
  incrementQuantity(): void {
    if (this.product) {
      let totalPrice = this.product.Precio;

      if (this.tableName === 'Cafes' || this.tableName === 'Bolleria'
          || this.tableName === 'Infusiones' || this.tableName === 'Tostadas' ) {
        this.selectedComplementos.forEach(complemento => {
          totalPrice += complemento.Precio;

        });
      }

      this.product.Cantidad = (this.product.Cantidad || 0) + 1;
      this.product.Complementos = this.selectedComplementos;
      this.product.PrecioTotal = Math.round(totalPrice * 100) / 100; // Redondear el precio total a dos decimales

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

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  // Volver a la página anterior, pero si no hay historial, navegar a la carta principal
  goBack() {
    // Solo navegar a rutas internas válidas
    // Volver a la lista de productos de la tabla actual usando la ruta correcta
    if (this.tableName && this.code && this.timestamp) {
      // Mapeo explícito de nombres de tabla a rutas
      const tableMap: { [key: string]: string } = {
        'Cafes': 'cafe',
        'Bolleria': 'bolleria',
        'Batidos Helados': 'batido-helado',
        'Helados Personalizados': 'helados',
        'Cubatas': 'cubatas',
        'Ginebras': 'ginebras',
        'Infusiones': 'infusiones',
        'Refrescos': 'refrescos',
        'Tostadas': 'tostadas',
        'Vapers': 'vapers',
        'Cervezas': 'cervezas',
        'Vinos': 'vinos',
        'Polos': 'polos',
        'Copas': 'copas',
        'Cocteles': 'cocteles',
        'Chupitos': 'chupitos',
        'Copas Helado': 'copas-helado',
        'Granizados': 'granizados',
        'Chocolates': 'chocolates',
        'Frappelatte': 'frappelatte',
        'Smoothies': 'smoothies',
        'Zumos': 'zumos',
        // Agrega aquí más equivalencias si tienes más tablas
      };
      let normalizedTable = tableMap[this.tableName] || this.tableName.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate([
        '/',
        this.timestamp,
        this.code,
        normalizedTable
      ], { queryParams: { title: this.tableName } });
    } else if (this.code && this.timestamp) {
      this.router.navigate(['/', this.timestamp, this.code, 'product-heladeria']);
    } else {
      // Fallback: ir a la carta principal de heladería
      this.router.navigate(['/heladeria']);
    }
  }
}
