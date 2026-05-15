import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model'; // Importar la interfaz Product
import { ActivatedRoute, Router } from '@angular/router';
import { InactivityService } from '../../services/inactivity.service';
import { AppExitService } from '../../services/app-exit.service';


@Component({
  selector: 'app-listaheladeria',
  templateUrl: './listaHeladeria.page.html',
  styleUrls: ['./listaHeladeria.page.scss'],
})
export class ListaHeladeriaPage implements OnInit, OnDestroy {
  data: Product[] = [];
  cartItems = 0;
  pageTitle: string = '';
  code: string | null = null; // Código de la mesa
  timestamp: string | null = null; // Timestamp
  allowedTablesForDetails: string[] = ['Cubatas','Helados Personalizados',
    'Ginebras','Infusiones','Refrescos']; // Lista de tablas permitidas
  selectedTable: string = '';

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

    // Leer el título desde queryParams si existe, si no desde params, si no localStorage
    this.route.queryParams.subscribe(qparams => {
      if (qparams['title']) {
        this.pageTitle = qparams['title'];
      } else {
        // Si no hay query param, mirar en params
        this.route.params.subscribe(params => {
          if (params['title']) {
            this.pageTitle = params['title'];
          } else {
            // Si no hay en params, mirar en localStorage
            const storedProductName = localStorage.getItem('selectedProduct');
            this.pageTitle = storedProductName ? storedProductName : 'Producto Desconocido';
          }
          this.selectedTable = this.pageTitle;
          if (this.pageTitle && this.pageTitle !== 'Producto Desconocido') {
            this.fetchProductsByTitle(this.pageTitle);
          }
        });
        return;
      }
      this.selectedTable = this.pageTitle;
      if (this.pageTitle && this.pageTitle !== 'Producto Desconocido') {
        this.fetchProductsByTitle(this.pageTitle);
      }
    });

    // Actualizar el número de elementos en el carrito
    this.updateCartItems();




  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  fetchProductsByTitle(title: string): void {
    console.log(`Fetching products from URL: ${this.orderService.apiUrl}/data/name/${title}`);
    this.orderService.getProductsByTitle(title).subscribe(products => {
      this.data = products.filter(data => data.Activo === 1);
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
      console.log('Producto seleccionado:', item);
      if (this.isTableAllowedForDetails() || item.ComplementoActivo === 1) {
        this.router.navigate([`/${this.timestamp}/${this.code}/product-detail`, this.pageTitle, item.Id]);
      } else {
        console.log('Este producto no tiene complemento habilitado y la tabla no está permitida para detalles.');
      }
    }

    // Optimización: TrackBy para mejorar rendimiento de ngFor
    trackByFn(index: number, item: Product): any {
      return item.Id || index;
    }

}
