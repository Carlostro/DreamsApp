import { Component, OnInit, OnDestroy } from '@angular/core';
// Utilidades para detectar navegadores
function isSafari() {
  const ua = window.navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}
function isChrome() {
  const ua = window.navigator.userAgent;
  return /chrome|crios/i.test(ua) && !/edge|edg|opr|opera|samsungbrowser/i.test(ua);
}
function isFirefox() {
  return /firefox|fxios/i.test(window.navigator.userAgent);
}
function isEdge() {
  return /edg/i.test(window.navigator.userAgent);
}
function isAndroid() {
  return /android/i.test(window.navigator.userAgent);
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
import { Router, ActivatedRoute } from '@angular/router';
import { TimestampService } from '../services/timestamp.service';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { AppExitService } from '../services/app-exit.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pagina-loading',
  templateUrl: './pagina-loading.component.html',
  styleUrls: ['./pagina-loading.component.scss']
})
export class PaginaLoadingComponent implements OnInit, OnDestroy {
    // GPS desactivado completamente para pruebas
    // showActivateGpsButton = false;
    // checkingLocation = false;
    // private locationRetryCount = 0;
    // private readonly MAX_LOCATION_RETRIES = 3;

    // async onActivateGps() {
    //   // GPS desactivado para pruebas
    // }

    // private async tryLocationWithRetries() {
    //   // GPS desactivado para pruebas
    // }

    // private async handleLocationFailure() {
    //   // GPS desactivado para pruebas
    // }
  countdown: number = 0;
  sessionId: string = '';
  TableOccupied: boolean = false; // Nueva variable de estado
  // locationVerified: boolean = false; // Estado de verificación de ubicación
  showButtons: boolean = false; // Controlar visualización de botones
  private currentCode: string = ''; // Guardar el código actual
  private apiUrl = `${environment.apiUrl}/active-tables`;

  private checkTableInterval: Subscription | null = null;
  private occupiedAlert: HTMLIonAlertElement | null = null; // Referencia al alerta de mesa ocupada
  private availableAlert: HTMLIonAlertElement | null = null; // Referencia al alerta de mesa disponible

  // Configuración de geolocalización (comentado para pruebas)
  // private readonly CENTER_LAT = 39.15075;  // Latitud del centro
  // private readonly CENTER_LNG = -0.43722;  // Longitud del centro
  // private readonly MAX_RADIUS_KM = 0.05;   // Radio máximo en kilómetros (50 metros)

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private timestampService: TimestampService,
    private alertController: AlertController,
    private http: HttpClient,
    private appExitService: AppExitService // Inyectar el servicio
  ) { }

  ngOnInit(): void {
    this.addRandomPositions();
    console.log('ngOnInit: Inicializando componente');
    this.timestampService.saveTimestamp();

    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      console.log('Código recibido en la página de carga:', code);

      if (code) {
        this.currentCode = code;
        // Mostrar GIFs de carga y mostrar botones directamente (GPS desactivado)
        this.showButtons = false;
        setTimeout(() => {
          this.showButtons = true;
          console.log('Mostrando botones (GPS desactivado)');
        }, 1500);
      } else {
        console.error('No se pudo obtener el código necesario para la redirección.');
      }
    });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy: Destruyendo componente');
    if (this.checkTableInterval) {
      this.checkTableInterval.unsubscribe();
    }
    this.removeSession();
  }
  //---------------Efectos para navidad----------------------------------------------------
  addRandomPositions() {
    const snowflakes = document.querySelectorAll('.snowflake');
    snowflakes.forEach((flake: any, index: number) => {
      // Generar una posición aleatoria en el eje X (0% a 100%)
      const randomPosition = Math.random() * 100;
      flake.style.left = `${randomPosition}%`;  // Aplicar la posición aleatoria

      // Aplicar un retraso aleatorio para que no caigan todos al mismo tiempo
      const randomDelay = Math.random() * 7;  // Retraso entre 0 y 5 segundos
      flake.style.animationDelay = `-${randomDelay}s`;  // Aplicar el retraso
    });
  }
//------------------------------------------------------------------------






  private createSession(code: string) {
    console.log('createSession: Creando sesión para el código:', code);
    this.isTableOccupied(code).subscribe(async isOccupied => {
      if (isOccupied) {
        console.log('createSession: La mesa está ocupada');
        this.TableOccupied = true; // Actualizar el estado
        this.occupiedAlert = await this.showAlert('Mesa Ocupada', 'Esta mesa ya está siendo utilizada en otro dispositivo. Por favor espera a que se libere.', false);
        this.startCheckingTable(code);
      } else {
        console.log('createSession: La mesa está disponible');
        this.addActiveTable(code).subscribe(() => {
          this.sessionId = `${code}_${new Date().getTime()}`;
          localStorage.setItem('sessionId', this.sessionId); // Guardar sessionId en localStorage
          console.log('createSession: Sesión creada con sessionId:', this.sessionId);

          const ultimoPedido = localStorage.getItem(`ultimoPedido_${code}`);
          if (ultimoPedido) {
            const ahora = new Date();
            const ultimoPedidoFecha = new Date(ultimoPedido);
            const diferenciaMinutos = (ahora.getTime() - ultimoPedidoFecha.getTime()) / 1000 / 60;

            if (diferenciaMinutos < 1) {
              this.countdown = Math.ceil((1 - diferenciaMinutos) * 60);
              console.log('createSession: Iniciando cuenta regresiva con countdown:', this.countdown);
              this.startCountdown();
              return;
            }
          }

          // Ya no navegamos automáticamente, esperamos a que el usuario presione un botón
          console.log('Sesión creada, esperando acción del usuario');
        });
      }
    });
  }

  private removeSession() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      console.log('removeSession: Eliminando sesión para el código:', code);
      this.removeActiveTable(code).subscribe(
        () => {
          console.log('Sesión eliminada para la mesa:', code);
          this.router.navigate([`/${code}/loading`]); // Redirigir a la página de carga con el número de mesa
        },
        (error) => {
          console.error('Error al eliminar la mesa:', error);
        }
      );
    }
  }

  private startCheckingTable(code: string) {
    console.log('startCheckingTable: Iniciando verificación periódica para el código:', code);
    this.checkTableInterval = interval(5000).subscribe(() => {
      this.isTableOccupied(code).subscribe(async isOccupied => {
        if (!isOccupied) {
          console.log('startCheckingTable: La mesa ahora está disponible');
          this.TableOccupied = false;
          if (this.occupiedAlert) {
            await this.occupiedAlert.dismiss(); // Cerrar el alerta de mesa ocupada
            this.occupiedAlert = null;
          }
          this.availableAlert = await this.showAlert('Mesa Disponible', 'La mesa ahora está disponible.', false);

          // Detener verificación periódica
          if (this.checkTableInterval) {
            this.checkTableInterval.unsubscribe();
            this.checkTableInterval = null;
          }

          // Cerrar alerta después de 2 segundos y mostrar botones
          setTimeout(async () => {
            if (this.availableAlert) {
              await this.availableAlert.dismiss();
              this.availableAlert = null;
            }
            // Mostrar botones para que el usuario elija
            this.showButtons = true;
            console.log('Mesa disponible, mostrando botones');
          }, 2000);
        }
      });
    });
  }

  private startCountdown() {
    console.log('startCountdown: Iniciando cuenta regresiva');
    const interval = setInterval(() => {
      this.countdown--;
      console.log('startCountdown: Countdown:', this.countdown);
      if (this.countdown <= 0) {
        clearInterval(interval);
        const timestamp = this.timestampService.generateComplexTimestamp();
        const code = this.route.snapshot.paramMap.get('code');
        const targetUrl = `${timestamp}/${code}/heladeria`;
        console.log('startCountdown: Redirigiendo a:', targetUrl);
        this.router.navigate([targetUrl]).then(() => {
          if (this.checkTableInterval) {
            this.checkTableInterval.unsubscribe(); // Detener la verificación periódica
          }
        });
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
    console.log('getLocalStorageSize: Tamaño total de localStorage:', total);
    return total;
  }

  // Método para verificar si una mesa está ocupada consultando el servidor
  private isTableOccupied(code: string) {
    console.log('isTableOccupied: Verificando si la mesa está ocupada para el código:', code);
    return this.http.get<string[]>(this.apiUrl).pipe(
      map(activeTables => activeTables.includes(code))
    );
  }

  // Método para añadir una mesa al array de mesas activas en el servidor
  private addActiveTable(code: string) {
    console.log('addActiveTable: Añadiendo mesa al array de mesas activas para el código:', code);
    return this.http.post(this.apiUrl, { code });
  }

  // Método para eliminar una mesa del array de mesas activas en el servidor
  private removeActiveTable(code: string) {
    console.log('removeActiveTable: Eliminando mesa del array de mesas activas para el código:', code);
    return this.http.delete(`${this.apiUrl}/${code}`);
  }

  // Método para resetear el array de mesas activas en el servidor
  resetActiveTables() {
    console.log('resetActiveTables: Reseteando array de mesas activas');
    this.http.delete(this.apiUrl).subscribe(() => {
      console.log('Array de mesas activas reseteado.');
    });
  }

  // Método para mostrar una alerta personalizada
  private async showAlert(header: string, message: string, showOkButton: boolean = true) {
    console.log('showAlert: Mostrando alerta con header:', header, 'y message:', message);
    const alert = await this.alertController.create({
      header,
      message,
      buttons: showOkButton ? ['OK'] : []
    });
    await alert.present();
    return alert;
  }

  // GPS desactivado completamente para pruebas
  // private async checkLocation(): Promise<boolean> { return true; }

  // Obtener la posición actual del usuario (comentado para pruebas)
  // private getCurrentPosition(): Promise<GeolocationPosition> {
  //   return new Promise((resolve, reject) => {
  //     navigator.geolocation.getCurrentPosition(
  //       resolve,
  //       reject,
  //       {
  //         enableHighAccuracy: true,
  //         timeout: 30000,
  //         maximumAge: 0
  //       }
  //     );
  //   });
  // }

  // Calcular la distancia entre dos puntos GPS usando la fórmula de Haversine (comentado para pruebas)
  // private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  //   const R = 6371; // Radio de la Tierra en kilómetros
  //   const dLat = this.toRadians(lat2 - lat1);
  //   const dLon = this.toRadians(lon2 - lon1);
  //
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const distance = R * c;
  //
  //   return distance;
  // }

  // Convertir grados a radianes (comentado para pruebas)
  // private toRadians(degrees: number): number {
  //   return degrees * (Math.PI / 180);
  // }

  // Métodos para los botones
  onLogin() {
    console.log('onLogin: Navegando a página de login');
    // Navegar a página de login SIN crear sesión
    this.router.navigate([`${this.currentCode}/login-users`]);
  }

  onRegister() {
    console.log('onRegister: Navegando a página de registro');
    // Navegar a página de registro SIN crear sesión
    this.router.navigate([`${this.currentCode}/registro`]);
  }

  onContinueWithoutRegister() {
    console.log('onContinueWithoutRegister: Continuando sin registro');
    // Crear sesión SOLO para continuar sin registro
    this.createSessionForAnonymous();
  }

  private createSessionForAnonymous() {
    const code = this.currentCode;
    if (!code) {
      console.error('No hay código disponible');
      return;
    }

    this.isTableOccupied(code).subscribe(async isOccupied => {
      if (isOccupied) {
        console.log('La mesa está ocupada');
        this.TableOccupied = true;
        this.showButtons = false;
        this.occupiedAlert = await this.showAlert('Mesa Ocupada', 'Esta mesa ya está siendo utilizada en otro dispositivo. Por favor espera a que se libere.', false);
        this.startCheckingTable(code);
      } else {
        console.log('La mesa está disponible, creando sesión para usuario anónimo');
        this.addActiveTable(code).subscribe(() => {
          this.sessionId = `${code}_${new Date().getTime()}`;
          localStorage.setItem('sessionId', this.sessionId);
          localStorage.setItem('sessionType', 'anonimo'); // Marcar como sesión anónima
          this.appExitService.initialize(code);
          console.log('Sesión creada con sessionId:', this.sessionId);

          const timestamp = this.timestampService.generateComplexTimestamp();
          const targetUrl = `${timestamp}/${code}/pagina-seleccion`;

          console.log('Navegando a:', targetUrl);
          this.router.navigate([targetUrl]).then(() => {
            if (this.checkTableInterval) {
              this.checkTableInterval.unsubscribe();
            }
          });
        });
      }
    });
  }
}
