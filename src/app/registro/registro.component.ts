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
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit, OnDestroy {
  nombre: string = '';
  alias: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  autorizacion: boolean = false;
  aliasDisponible: boolean | null = null;
  verificandoAlias: boolean = false;
  private code: string = '';
  private apiUrl = `${environment.apiUrl}/active-tables`;
  private aliasCheckTimeout: any;

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
      console.log('Código de mesa en registro:', this.code);
    });

    // Iniciar control de inactividad con timeout fijo (sin reseteo)
    this.inactivityService.startWatching(true);
  }

  ngOnDestroy(): void {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();

    // Limpiar timeout si existe
    if (this.aliasCheckTimeout) {
      clearTimeout(this.aliasCheckTimeout);
    }
  }

  // Verificar alias en tiempo real con debounce
  onAliasChange(): void {
    // Limpiar verificación anterior
    if (this.aliasCheckTimeout) {
      clearTimeout(this.aliasCheckTimeout);
    }

    // Resetear estado
    this.aliasDisponible = null;

    // Validar longitud mínima
    if (this.alias.length < 3) {
      return;
    }

    // Validar formato
    if (!/^[a-zA-Z0-9_]+$/.test(this.alias)) {
      return;
    }

    // Esperar 500ms después de que el usuario deje de escribir
    this.verificandoAlias = true;
    this.aliasCheckTimeout = setTimeout(() => {
      this.clientesService.verificarAlias(this.alias).subscribe(
        (response) => {
          this.verificandoAlias = false;
          this.aliasDisponible = !response.exists;
        },
        (error) => {
          console.error('Error al verificar alias:', error);
          this.verificandoAlias = false;
          this.aliasDisponible = null;
        }
      );
    }, 500);
  }

  async onRegister() {
    // Validaciones
    if (!this.nombre.trim() || !this.alias.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      await this.showAlert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (this.alias.length < 3) {
      await this.showAlert('Error', 'El alias debe tener al menos 3 caracteres');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(this.alias)) {
      await this.showAlert('Error', 'El alias solo puede contener letras, números y guiones bajos');
      return;
    }

    // Verificar disponibilidad del alias antes de continuar
    if (this.aliasDisponible === false) {
      await this.showAlert('Error', 'Este alias ya está en uso. Por favor, elige otro');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      await this.showAlert('Error', 'Por favor, ingresa un correo electrónico válido');
      return;
    }

    if (this.password.length < 6) {
      await this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando...',
      spinner: 'crescent'
    });
    await loading.present();

    this.clientesService.registrarCliente(this.nombre, this.alias, this.email, this.password, this.autorizacion).subscribe(
      async (response) => {
        if (response.success && response.cliente && response.alias) {
          await this.showAlert(
            'Registro Exitoso',
            `¡Bienvenido ${this.nombre}! Tu alias es: ${response.alias}`
          );

          // Guardar datos del cliente en localStorage
          this.clientesService.guardarClienteEnLocal(response.cliente);

          // Crear sesión de mesa después del registro exitoso
          await this.createTableSession();
          await loading.dismiss();
        } else {
          await loading.dismiss();
          await this.showAlert('Error', response.message || 'No se pudo completar el registro');
        }
      },
      async (error) => {
        await loading.dismiss();
        console.error('Error al registrar:', error);

        let errorMessage = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        await this.showAlert('Error', errorMessage);
      }
    );
  }

  async onCancel() {
    // Volver a la página de loading
    this.router.navigate([`/${this.code}/loading`]);
  }

  goToLogin() {
    // Navegar a la página de login
    this.router.navigate([`/${this.code}/login-users`]);
  }

  private async createTableSession() {
    return new Promise<void>((resolve, reject) => {
      const clienteId = localStorage.getItem('userId');
      if (!clienteId) {
        console.error('No se encontró el ID del cliente');
        reject();
        return;
      }

      const sessionId = `${this.code}_${new Date().getTime()}_cliente_${clienteId}`;

      // Crear sesión de cliente (NO de mesa anónima)
      this.clientesService.crearSesionCliente(parseInt(clienteId), this.code, sessionId).subscribe(
        (response) => {
          if (response.success) {
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('sessionType', 'cliente'); // Marcar como sesión de cliente
            this.appExitService.initialize(this.code);
            console.log('[REGISTRO] Sesión de cliente creada:', sessionId);

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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
