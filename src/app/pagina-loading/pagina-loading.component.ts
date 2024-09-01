import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TimestampService } from '../services/timestamp.service';

@Component({
  selector: 'app-pagina-loading',
  templateUrl: './pagina-loading.component.html',
  styleUrls: ['./pagina-loading.component.scss']
})
export class PaginaLoadingComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private timestampService: TimestampService
  ) { }

  ngOnInit(): void {
    // Recuperar el timestamp guardado desde el servicio
    const savedTimestamp = this.timestampService.getSavedTimestamp();
    const savedRandomString = this.timestampService.getSavedRandomString();

    console.log('Timestamp guardado:', savedTimestamp); // Log para verificar el timestamp guardado
    console.log('String aleatorio guardado:', savedRandomString); // Log para verificar el string aleatorio guardado

    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      console.log('Código recibido en la página de carga:', code); // Log para verificar el código recibido

      if (code && savedTimestamp && savedRandomString) {
        const timestamp = this.timestampService.generateComplexTimestamp();
        console.log('Timestamp generado:', timestamp); // Log para verificar el timestamp generado

        setTimeout(() => {
          const targetUrl = `${timestamp}/${code}/heladeria`;
          console.log('Redirigiendo a:', targetUrl);
          this.router.navigate([targetUrl]);
        }, 3000); // Simula un tiempo de carga de 3 segundos
      }
    });
  }
}
