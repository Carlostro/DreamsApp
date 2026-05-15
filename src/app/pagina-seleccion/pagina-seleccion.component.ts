import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppExitService } from '../services/app-exit.service';
import { InactivityService } from '../services/inactivity.service';

@Component({
  selector: 'app-pagina-seleccion',
  templateUrl: './pagina-seleccion.component.html',
  styleUrls: ['./pagina-seleccion.component.scss'],
})
export class PaginaSeleccionComponent implements OnInit, OnDestroy {
  code: string | null = null;
  timestamp: string | null = null;
  kioscoRoute: string | null = null;
  heladeriaRoute: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appExitService: AppExitService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp');

      if (this.code && this.timestamp) {
        this.kioscoRoute = `/${this.timestamp}/${this.code}/kiosco`;
        this.heladeriaRoute = `/${this.timestamp}/${this.code}/heladeria`;
        this.appExitService.initialize(this.code);
      }
    });
  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  irAKiosco() {
    if (this.kioscoRoute) {
      this.router.navigate([this.kioscoRoute]);
    }
  }

  irAHeladeria() {
    if (this.heladeriaRoute) {
      this.router.navigate([this.heladeriaRoute]);
    }
  }
}
