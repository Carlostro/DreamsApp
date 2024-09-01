import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-product-kiosco',
  templateUrl: './product-kiosco.page.html',
  styleUrls: ['./product-kiosco.page.scss'],
})
export class ProductKioscoPage implements OnInit {
  pageTitle: string = '';
  cartItems = 0;
  code: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController) {}

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
  goBack() {
    this.navCtrl.back();
  }
}
