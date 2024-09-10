import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TimestampService } from '../services/timestamp.service';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-pagina-loading',
  templateUrl: './pagina-loading.component.html',
  styleUrls: ['./pagina-loading.component.scss']
})
export class PaginaLoadingComponent implements OnInit, OnDestroy {
  countdown: number = 0;
  sessionId: string = '';
  TableOccupied: boolean = false; // Nueva variable de estado
  private apiUrl = 'http://192.168.1.44:3000/active-tables'; // URL de la API REST
  private checkTableInterval: Subscription | null = null;
  private occupiedAlert: HTMLIonAlertElement | null = null; // Referencia al alerta de mesa ocupada
  private availableAlert: HTMLIonAlertElement | null = null; // Referencia al alerta de mesa disponible

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private timestampService: TimestampService,
    private alertController: AlertController,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.timestampService.saveTimestamp();

    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      console.log('Código recibido en la página de carga:', code);

      if (code) {
        this.checkTableAvailability(code);
      } else {
        console.error('No se pudo obtener el código necesario para la redirección.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.checkTableInterval) {
      this.checkTableInterval.unsubscribe();
    }
  }

  private checkTableAvailability(code: string) {
    this.isTableOccupied(code).subscribe(async isOccupied => {
      if (isOccupied) {
        this.TableOccupied = true; // Actualizar el estado
        this.occupiedAlert = await this.showAlert('Mesa Ocupada', 'Esta mesa ya está siendo utilizada en otro dispositivo. Por favor espera a que se libere.', false);
        this.startCheckingTable(code);
      } else {
        this.addActiveTable(code).subscribe(() => {
          this.sessionId = `${code}_${new Date().getTime()}`;

          const ultimoPedido = localStorage.getItem(`ultimoPedido_${code}`);
          if (ultimoPedido) {
            const ahora = new Date();
            const ultimoPedidoFecha = new Date(ultimoPedido);
            const diferenciaMinutos = (ahora.getTime() - ultimoPedidoFecha.getTime()) / 1000 / 60;

            if (diferenciaMinutos < 1) {
              this.countdown = Math.ceil((1 - diferenciaMinutos) * 60);
              this.startCountdown();
              return;
            }
          }

          setTimeout(() => {
            const timestamp = this.timestampService.generateComplexTimestamp();
            console.log('Timestamp generado:', timestamp);

            const targetUrl = `${timestamp}/${code}/heladeria`;
            console.log('Redirigiendo a:', targetUrl);
            this.router.navigate([targetUrl]);
          }, 3000);
        });
      }
    });
  }

  private startCheckingTable(code: string) {
    this.checkTableInterval = interval(5000).subscribe(() => {
      this.isTableOccupied(code).subscribe(async isOccupied => {
        if (!isOccupied) {
          this.TableOccupied = false;
          if (this.occupiedAlert) {
            await this.occupiedAlert.dismiss(); // Cerrar el alerta de mesa ocupada
            this.occupiedAlert = null;
          }
          this.availableAlert = await this.showAlert('Mesa Disponible', 'La mesa ahora está disponible. Redirigiendo...', false);
          this.addActiveTable(code).subscribe(() => {
            this.sessionId = `${code}_${new Date().getTime()}`;


            setTimeout(() => {
              const timestamp = this.timestampService.generateComplexTimestamp();
              console.log('Timestamp generado:', timestamp);

              const targetUrl = `${timestamp}/${code}/heladeria`;
              console.log('Redirigiendo a:', targetUrl);
              if (this.availableAlert) {
                this.availableAlert.dismiss(); // Cerrar el alerta de mesa disponible
                this.availableAlert = null;
              }
              this.router.navigate([targetUrl]);
            }, 3000);
          });
        }
      });
    });
  }

  private startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        const timestamp = this.timestampService.generateComplexTimestamp();
        const code = this.route.snapshot.paramMap.get('code');
        const targetUrl = `${timestamp}/${code}/heladeria`;
        this.router.navigate([targetUrl]);
      }
    }, 1000);
  }

  private getLocalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    return total;
  }

  // Método para verificar si una mesa está ocupada consultando el servidor
  private isTableOccupied(code: string) {
    return this.http.get<string[]>(this.apiUrl).pipe(
      map(activeTables => activeTables.includes(code))
    );
  }

  // Método para añadir una mesa al array de mesas activas en el servidor
  private addActiveTable(code: string) {
    return this.http.post(this.apiUrl, { code });
  }

  // Método para eliminar una mesa del array de mesas activas en el servidor
  private removeActiveTable(code: string) {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }

  // Método para resetear el array de mesas activas en el servidor
  resetActiveTables() {
    this.http.delete(this.apiUrl).subscribe(() => {
      console.log('Array de mesas activas reseteado.');
    });
  }

  // Método para mostrar una alerta personalizada
  private async showAlert(header: string, message: string, showOkButton: boolean = true) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: showOkButton ? ['OK'] : []
    });
    await alert.present();
    return alert;
  }
}
