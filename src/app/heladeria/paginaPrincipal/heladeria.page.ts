import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppExitService } from '../../services/app-exit.service';
import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-heladeria',
  templateUrl: './heladeria.page.html',
  styleUrls: ['./heladeria.page.scss'],
})
export class HeladeriaPage implements OnInit, OnDestroy {
  code: string | null = null;
  timestamp: string | null = null;
  promosRoute: string | null = null;
  productRoute: string | null = null;
  promoPuntosRoute: string | null = null;
  misPedidosRoute: string | null = null;
  isRegisteredUser: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private appExitService: AppExitService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    // Verificar si el usuario está registrado
    const sessionType = localStorage.getItem('sessionType');
    this.isRegisteredUser = sessionType === 'cliente';

    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp'); // Obtener el timestamp de los parámetros de la ruta

      console.log('timestamp', this.timestamp);
      console.log('code', this.code);
      console.log('Usuario registrado:', this.isRegisteredUser);

      if (this.code && this.timestamp) {
        this.promosRoute = `/${this.timestamp}/${this.code}/promos-heladeria`;
        this.productRoute = `/${this.timestamp}/${this.code}/product-heladeria`;
        this.promoPuntosRoute = `/${this.timestamp}/${this.code}/promo-puntos`;
        this.misPedidosRoute = `/${this.timestamp}/${this.code}/mis-pedidos`;

        // Inicializar el servicio con el número de mesa
        this.appExitService.initialize(this.code);
      }
    });
  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }
}
