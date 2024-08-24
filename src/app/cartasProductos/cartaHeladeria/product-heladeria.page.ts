import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-product-heladeria',
  templateUrl: './product-heladeria.page.html',
  styleUrls: ['./product-heladeria.page.scss'],
})
export class ProductHeladeriaPage implements OnInit {
  pageTitle: string = '';
  cartItems = 0;
  code: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code'); });


    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });
    this.updateTitle();
  }

  updateTitle() {
    const currentRoute = this.route.snapshot.firstChild?.routeConfig?.path;
    switch (currentRoute) {
      case 'cervezas':
        this.pageTitle = 'Cervezas';
        console.log('Cervezas');
        break;
      case 'granizados':
        this.pageTitle = 'Granizados';
        break;
      case 'refrescos':
        this.pageTitle = 'Refrescos';
        break;
      case 'polos':
        this.pageTitle = 'Polos';
        break;
      case 'copas-helado':
        this.pageTitle = 'Copas de Helado';
        break;
      case 'helados':
          this.pageTitle = 'Helados Personalizados';
          break;
      case 'ginebras':
        this.pageTitle = 'Ginebras';
        break;
      case 'cubatas':
        this.pageTitle = 'Cubatas';
        break;
      case 'batido-helado':
        this.pageTitle = 'Batido Helado';
        break;
      case 'zumos':
        this.pageTitle = 'Zumos';
        break;
      case 'smoothies':
        this.pageTitle = 'Smoothies';
        break;
      case 'vinos':
        this.pageTitle = 'Vinos';
        break;
      case 'cafe':
        this.pageTitle = 'Café';
        break;
      case 'bolleria':
        this.pageTitle = 'Bollería';
        break;
      default:
        this.pageTitle = 'Carta de Productos';
        break;
    }
  }
}
