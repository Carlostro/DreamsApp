import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { TimestampService } from '../services/timestamp.service';
import { ClientesService } from '../services/clientes.service';
import { HttpClient } from '@angular/common/http';
import { AppExitService } from '../services/app-exit.service';
import { InactivityService } from '../services/inactivity.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login-users',
  templateUrl: './login-users.component.html',
  styleUrls: ['./login-users.component.scss']
})
export class LoginUsersComponent implements OnInit, OnDestroy {
  alias: string = '';
  password: string = '';
  private code: string = '';
  private apiUrl = `${environment.apiUrl}/active-tables`;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private timestampService: TimestampService,
    private clientesService: ClientesService,
    private http: HttpClient,
    private appExitService: AppExitService,
    private inactivityService: InactivityService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code') || '';
      console.log('Código de mesa en login-users:', this.code);
    });

    // Iniciar control de inactividad con timeout fijo (sin reseteo)
    this.inactivityService.startWatching(true);
  }

  ngOnDestroy(): void {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  async onLogin() {
    if (!this.alias.trim() || !this.password.trim()) {
      await this.showAlert('Error', 'Por favor, completa todos los campos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.clientesService.loginCliente(this.alias, this.password).subscribe(
      async (response) => {
        console.log('[LOGIN] Respuesta del servidor:', response);
        if (response.success && response.cliente) {
          console.log('[LOGIN] Cliente recibido:', response.cliente);

          // Guardar datos del cliente en localStorage
          this.clientesService.guardarClienteEnLocal(response.cliente, response.token);

          // Verificar que se guardó correctamente
          const userId = localStorage.getItem('userId');
          console.log('[LOGIN] userId guardado en localStorage:', userId);
          console.log('[LOGIN] Código de mesa:', this.code);

          // Crear sesión de mesa después del login exitoso
          try {
            await this.createTableSession();
            await loading.dismiss();
          } catch (error) {
            console.error('[LOGIN] Error al crear sesión de mesa:', error);
            await loading.dismiss();
          }
        } else {
          await loading.dismiss();
          await this.showAlert('Error', response.message || 'Alias o contraseña incorrectos');
        }
      },
      async (error) => {
        await loading.dismiss();
        console.error('Error al iniciar sesión:', error);
        await this.showAlert('Error', 'No se pudo conectar con el servidor. Inténtalo de nuevo.');
      }
    );
  }

  async onCancel() {
    // Volver a la página de loading
    this.router.navigate([`/${this.code}/loading`]);
  }

  goToRegister() {
    // Navegar a la página de registro
    this.router.navigate([`/${this.code}/registro`]);
  }

  private async createTableSession() {
    console.log('[LOGIN] createTableSession - Iniciando...');
    return new Promise<void>((resolve, reject) => {
      const clienteId = localStorage.getItem('userId');
      console.log('[LOGIN] clienteId obtenido:', clienteId);
      console.log('[LOGIN] código de mesa:', this.code);

      if (!clienteId) {
        console.error('[LOGIN] No se encontró el ID del cliente en localStorage');
        reject();
        return;
      }

      const sessionId = `${this.code}_${new Date().getTime()}_cliente_${clienteId}`;
      console.log('[LOGIN] sessionId generado:', sessionId);
      console.log('[LOGIN] Llamando a crearSesionCliente con:', {
        clienteId: parseInt(clienteId),
        code: this.code,
        sessionId: sessionId
      });

      // Crear sesión de cliente (NO de mesa anónima)
      this.clientesService.crearSesionCliente(parseInt(clienteId), this.code, sessionId).subscribe(
        (response) => {
          if (response.success) {
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('sessionType', 'cliente'); // Marcar como sesión de cliente
            this.appExitService.initialize(this.code);
            console.log('[LOGIN] Sesión de cliente creada:', sessionId);

            // Detener el control de inactividad ANTES de navegar
            this.inactivityService.stopWatching();

            // Navegar a la página de selección
            const timestamp = this.timestampService.generateComplexTimestamp();
            const targetUrl = `${timestamp}/${this.code}/pagina-seleccion`;
            this.router.navigate([targetUrl]);
            resolve();
          } else {
            this.showAlert('Mesa Ocupada', response.message || 'Esta mesa ya está ocupada');
            reject();
          }
        },
        (error) => {
          console.error('Error al crear sesión de cliente:', error);
          // Mostrar el mensaje específico del servidor si está disponible
          let errorMessage = 'No se pudo crear la sesión. Inténtalo de nuevo.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          // Si es error 409, es mesa ocupada
          const errorTitle = error.status === 409 ? 'Mesa Ocupada' : 'Error';
          this.showAlert(errorTitle, errorMessage);
          reject(error);
        }
      );
    });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
