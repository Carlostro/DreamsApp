import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppExitService } from '../../services/app-exit.service';
import { InactivityService } from '../../services/inactivity.service';


@Component({
  selector: 'app-kiosco',
  templateUrl: './kiosco.page.html',
  styleUrls: ['./kiosco.page.scss'],
})
export class KioscoPage implements OnInit, OnDestroy {
  code: string | null = null;
  timestamp: string | null = null;
  productRoute: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private appExitService: AppExitService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    this.timestamp = params.get('timestamp');


      console.log('timestamp', this.timestamp);
      console.log('code', this.code);

    if (this.code && this.timestamp) {
      this.productRoute = `/${this.timestamp}/${this.code}/product-kiosco`;

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
