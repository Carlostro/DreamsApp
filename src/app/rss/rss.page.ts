import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InactivityService } from '../services/inactivity.service';
import { AppExitService } from '../services/app-exit.service';
@Component({
  selector: 'app-rss',
  templateUrl: './rss.page.html',
  styleUrls: ['./rss.page.scss'],
})
export class RssPage implements OnInit, OnDestroy {
  code: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private inactivityService: InactivityService,
    private appExitService: AppExitService
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    });

    // Inicializar AppExitService con el código de mesa
    if (this.code) {
      this.appExitService.initialize(this.code);
    }


  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }
}
