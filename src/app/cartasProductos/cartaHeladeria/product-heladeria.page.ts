import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,NavigationEnd } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-product-heladeria',
  templateUrl: './product-heladeria.page.html',
  styleUrls: ['./product-heladeria.page.scss'],
})
export class ProductHeladeriaPage implements OnInit {
  pageTitle: string = '';
  cartItems = 0;
  code: string | null = null;
  timestamp: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    this.timestamp = params.get('timestamp');
   });
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

  updateTitle() {
    const currentRoute = this.route.snapshot.firstChild?.routeConfig?.path;
    const routeTitleMap: { [key: string]: string } = {
      'cervezas': 'Cervezas',
      'granizados': 'Granizados',
      'refrescos': 'Refrescos',
      'polos': 'Polos',
      'copas-helado': 'Copas de Helado',
      'helados': 'Helados Personalizados',
      'ginebras': 'Ginebras',
      'cubatas': 'Cubatas',
      'batido-helado': 'Batidos Helados',
      'zumos': 'Zumos',
      'smoothies': 'Smoothies',
      'vinos': 'Vinos',
      'cafe': 'Café',
      'bolleria': 'Bollería',
      'frappelatte': 'Frappelatte',
      'infusiones': 'Infusiones',
      'chocolates': 'Chocolates',
      'chupitos': 'Chupitos',
      'copas': 'Copas',
      'cocteles': 'Cócteles'
    };

    if (currentRoute !== undefined) {
      this.pageTitle = routeTitleMap[currentRoute] || 'Carta de Productos';
      if (currentRoute === 'cervezas') {
        console.log('Cervezas');
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
