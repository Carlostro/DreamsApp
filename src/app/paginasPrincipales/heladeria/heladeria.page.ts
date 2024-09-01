import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-heladeria',
  templateUrl: './heladeria.page.html',
  styleUrls: ['./heladeria.page.scss'],
})
export class HeladeriaPage implements OnInit {
  code: string | null = null;
  timestamp: string | null = null;
  promosRoute: string | null = null;
  productRoute: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp'); // Obtener el timestamp de los parámetros de la ruta

      console.log('timestamp', this.timestamp);
      console.log('code', this.code);

      if (this.code && this.timestamp) {
        this.promosRoute = `/${this.timestamp}/${this.code}/promos-heladeria`;
        this.productRoute = `/${this.timestamp}/${this.code}/product-heladeria`;
      }
    });
  }
}
