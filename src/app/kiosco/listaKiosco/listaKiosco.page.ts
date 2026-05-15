import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model'; // Importar la interfaz Product
import { ActivatedRoute ,Router} from '@angular/router';
import { TimestampService } from '../../services/timestamp.service';
import { InactivityService } from '../../services/inactivity.service';
import { AppExitService } from '../../services/app-exit.service';

@Component({
  selector: 'app-listakiosco',
  templateUrl: './listaKiosco.page.html',
  styleUrls: ['./listaKiosco.page.scss'],
})
export class ListaKioscoPage implements OnInit, OnDestroy {

  data: Product[] = [];
  cartItems = 0;
  pageTitle: string = '';
  code: string | null = null;
  timestamp: string | null = null;
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

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
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

  // Optimización: TrackBy para mejorar rendimiento de ngFor
  trackByFn(index: number, item: Product): any {
    return item.Id || index;
  }
}

