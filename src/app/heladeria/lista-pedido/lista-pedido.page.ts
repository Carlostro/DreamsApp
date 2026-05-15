import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import ConectorPluginV3 from '../../ConectorPluginV3';
import { Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { ClientesService } from '../../services/clientes.service';
import { InactivityService } from '../../services/inactivity.service';
import { AppExitService } from '../../services/app-exit.service';

@Component({
  selector: 'app-lista-pedido',
  templateUrl: './lista-pedido.page.html',
  styleUrls: ['./lista-pedido.page.scss'],
})
export class ListaPedidoPage implements OnInit, OnDestroy {
  private readonly ACCESS_EXPIRATION_MS = 10 * 60 * 1000;
  orderList: Product[] = [];
  totalCost: number = 0;
  code: string | null = null;
  timestamp: string | null = null;
  isSending: boolean = false;
  isAccessContextValid: boolean = false;

  constructor(
    private orderService: OrderService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private router: Router,
    private ticketsService: TicketsService,
    private clientesService: ClientesService,
    private inactivityService: InactivityService,
    private appExitService: AppExitService
  ) { }

  ngOnInit() {
    // Iniciar control de inactividad
    this.inactivityService.startWatching();

    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp');
      this.validateAccessContext();

      // Inicializar AppExitService con el código de mesa
      if (this.code) {
        this.appExitService.initialize(this.code);
      }
    });

    this.loadOrderList();
  }

  ngOnDestroy() {
    // Detener control de inactividad al salir del componente
    this.inactivityService.stopWatching();
  }

  navigateToCarta() {
    if (this.code && this.timestamp) {
      this.router.navigate(['/', this.timestamp, this.code, 'product-heladeria']);
    }
  }

  navigateToHome() {
    if (this.code && this.timestamp) {
      this.router.navigate(['/', this.timestamp, this.code, 'heladeria']);
    }
  }

  async showAlert(header: string, message: string) {
    let cssClass = '';

    if (header === 'Sesión Expirada') {
      cssClass = 'custom-alert-message';
    }

    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (header === 'Sesión Expirada') {
              window.location.href = 'https://www.instagram.com/dreamsalzira';
            }
          }
        }
      ],
      cssClass
    });

    await alert.present();
  }

  loadOrderList(): void {
    this.orderService.getOrderList().subscribe(orderList => {
      this.orderList = orderList;
      this.calculateTotalCost();
    });
  }

  // Método para determinar el precio correcto
  getProductPrice(product: Product): number {
    return product.PrecioTotal !== undefined ? product.PrecioTotal : product.Precio;
  }

  calculateTotalCost(): void {
    this.totalCost = this.orderList.reduce((total, product) => total + (product.Cantidad * this.getProductPrice(product)), 0);
  }

  incrementQuantity(product: Product): void {
    this.orderService.addProduct(product);
    this.loadOrderList();
  }

  decrementQuantity(product: Product): void {
    if (product.Cantidad > 1) {
      product.Cantidad -= 1;
      this.orderService.updateProductQuantity(product);
    } else {
      this.orderService.removeProduct(product);
    }
    this.loadOrderList();
  }

  async printOrder() {
    if (!this.isAccessContextValid) {
      await this.showAlert(
        'Acceso no válido',
        'Tu sesión ha caducado o la URL no coincide con la mesa. Vuelve a escanear el código para realizar un nuevo pedido.'
      );
      return;
    }

    if (this.isSending) {
      return; // Si ya se está enviando, no hacer nada
    }

    this.isSending = true; // Deshabilitar el botón de enviar

    // Crear un nuevo objeto conector para cada impresión
    const conector = new ConectorPluginV3();

    console.log('Imprimir pedido');
    const codigo = this.code; // Código recogido de la URL
    const fechaHoy = new Date();
    const fecha = fechaHoy.toLocaleDateString();
    const hora = fechaHoy.toLocaleTimeString();

    //---------------------------------------------------------
    // Función para obtener la semana ISO-8601
    function getISOWeekNumber(date: Date): number {
      const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const day = tempDate.getUTCDay() || 7; // lunes = 1, domingo = 7
      tempDate.setUTCDate(tempDate.getUTCDate() + 4 - day); // mover al jueves
      const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return weekNo;
    }

    // Datos de fecha
    const semana = getISOWeekNumber(fechaHoy).toString().padStart(2, '0');
    const mes = (fechaHoy.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaHoy.getFullYear().toString().slice(-2);

    const codigoFecha = `${semana}${mes}${año}`; // Código de 6 cifras
    console.log(codigoFecha);

    conector
      .Iniciar()
      .Corte(0)
      .EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
      .Feed(1)
      //.CargarImagenLocalEImprimir("C:/Users/User/Desktop/DreamsApp/src/assets/logo ticket.png", 0, 0)
      //Gastamos esta direccion para llamar al logo desde el pc de la impresora
      .CargarImagenLocalEImprimir("C:/Users/Dreams/Pictures/logo ticket.png", 0, 0)
      .Feed(1)
      .Iniciar()
      .EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
      .EscribirTexto(`DON VITE S.L\n`)
      .EscribirTexto(`CIF B97074843\n`)
      .EscribirTexto(`PLAZA MAYOR 58\n`)
      .EscribirTexto(`ALZIRA\n`)
      .EscribirTexto("=========================================\n")
      .EscribirTexto(`DreamsApp               Mesa: ${codigo}\n`)
      .EscribirTexto(`Fecha: ${fecha}         Hora: ${hora}\n`)
      .EscribirTexto("----------------------------------------\n")
      .EscribirTexto("Unid  Descripcion         Precio   Importe\n")
      .EscribirTexto("----------------------------------------\n")
      .Iniciar()


    let totalLista = 0;
    const maxNombreLength = 22; // Longitud máxima del nombre del producto

    this.orderList.forEach(product => {
      const totalProducto = product.Cantidad * product.Precio;

      // Calcular el total de los complementos
      let totalComplementos = 0;
      if (product.Complementos && product.Complementos.length > 0) {
        product.Complementos.forEach(complemento => {
          totalComplementos += complemento.Precio;
        });
      }

      const totalProductoConComplementos = totalProducto + totalComplementos;
      totalLista += totalProductoConComplementos;

      // Definir columnas fijas para cada elemento
      const columnaCantidad = 2; // Columna fija para la cantidad
      const columnaNombre = 5; // este valor ajusta la distancia entre el nombre y el precio
      const columnaPrecio = 8; // Columna fija para el precio
      const columnaImporte = 9; // Columna fija para el importe
      const columnaPrecioComplemento = 7; // Columna fija para el precio

      //----------------------------------------------------------------------------------------------
      //                     Ajustes para el nombre del producto
      //----------------------------------------------------------------------------------------------

      // Ajustamos el nombre del producto si es más largo de 22 letras
      let nombre = product.Nombre || ''; // Asegurarse de que el nombre no sea undefined
      const maxNombreLength = 22; // Definir la longitud máxima del nombre

      let nombreDividido = '';
      if (nombre.length > maxNombreLength) {
        // Dividir el nombre en líneas de longitud máxima
        while (nombre.length > maxNombreLength) {
          // Buscar el último espacio en la cadena antes de cortar
          let corte = nombre.lastIndexOf(' ', maxNombreLength);
          if (corte === -1) {
            corte = maxNombreLength; // Si no hay espacio, cortar en la longitud máxima
          }

          // Añadir la primera línea (sin moverla, ya que empieza donde debe)
          nombreDividido += nombre.substring(0, corte).padEnd(maxNombreLength, ' ') + '\n';
          nombre = nombre.substring(corte).trim(); // Eliminar espacios al inicio de la siguiente línea
        }

        // Rellenar la segunda línea con espacios al inicio para alinear
        const espacioInicio = ''.padEnd(2, ' ');
        nombreDividido += espacioInicio + nombre.padEnd(maxNombreLength, ' ');

      } else {
        // Si el nombre es más corto de 22 caracteres, rellenar con espacios
        nombreDividido = nombre.padEnd(maxNombreLength, ' ');
      }

      const nombreFormateado = nombreDividido;

      // Formatear el resto de las columnas
      const cantidadFormateada = product.Cantidad.toString().padEnd(columnaCantidad, ' ');
      const precioFormateado = product.Precio.toFixed(2).padStart(columnaPrecio, ' ');
      const importeFormateado = totalProductoConComplementos.toFixed(2).padStart(columnaImporte, ' ');
      //Imprimir el producto sin complementos
      console.log('numero de letras nombre:', product.Nombre.length);
      conector.EscribirTexto(`${cantidadFormateada}${nombreFormateado}${precioFormateado}${importeFormateado}\n`);

      //---------------------------------------------------------------------------------------------------------------
      //                               Ajuste de los complementos
      //---------------------------------------------------------------------------------------------------------------

      // Añadir complementos si existen
      if (product.Complementos && product.Complementos.length > 0) {
        product.Complementos.forEach(complemento => {
          let complementoNombre = complemento.Nombre || ''; // Sin padding adicional
          const complementoPrecio = complemento.Precio !== undefined ? complemento.Precio.toFixed(2) : '0.00';

          // Rellenar el nombre del complemento hasta 20 caracteres con espacios si no ocupa 20 letras
          console.log('numero de letras complemento:', complementoNombre.length);
          if (complementoNombre.length < 20) {
            let rellenaHuecos = 20 - complementoNombre.length;
            complementoNombre = complementoNombre.padEnd(complementoNombre.length + rellenaHuecos, ' ');
          }

          // Imprimir el complemento
          const complementoNombreFormateado = complementoNombre.padEnd(columnaNombre, ' '); // Ajustar la posición del nombre del complemento
          let complementoPrecioFormateado = '';

          // Si el precio no es 0, formatear e imprimir el precio
          if (parseFloat(complementoPrecio) !== 0) {
            complementoPrecioFormateado = complementoPrecio.padStart(columnaPrecioComplemento, ' '); // Ajustar la posición del precio del complemento
          }

          conector.EscribirTexto(`   + ${' '.repeat(columnaCantidad - 2)}${complementoNombreFormateado}${complementoPrecioFormateado}\n`);
        });
      }
    });
    //---------------------------------------------------------------------------------------------------------------

    conector.EscribirTexto("----------------------------------------\n");
    conector.EstablecerAlineacion(ConectorPluginV3.ALINEACION_DERECHA);
    conector.EstablecerTamañoFuente(2, 2);
    conector.EscribirTexto(`\nTOTAL: ${totalLista.toFixed(2)}\n`);

    conector.EstablecerAlineacion(ConectorPluginV3.ALINEACION_DERECHA);
    conector.EstablecerTamañoFuente(1, 1);
    conector.EscribirTexto("----------------------------------------\n");

    conector.EscribirTexto("\n");
    conector.EscribirTexto("\n");
    conector.EscribirTexto("\n");
    conector.EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
    conector.EstablecerTamañoFuente(1, 1);
    conector.EscribirTexto(`CODIGO ACCESO SERVICIOS: ${codigoFecha}#\n`);
    conector.EscribirTexto("Gracias por su visita\n");
    conector.Corte(80);


    try {
      // Guardar el total del pedido para mostrar puntos potenciales si el usuario no está registrado
      localStorage.setItem('ultimoTotalPedido', this.totalCost.toString());
      // Guardar puntos ganados en localStorage ANTES de navegar (para usuarios registrados)
      const sessionType = localStorage.getItem('sessionType');
      if (sessionType === 'cliente') {
        // Simular cálculo de puntos ganados (ajustar si hay lógica específica)
        const puntosGanados = Math.floor(this.totalCost); // O el cálculo real
        localStorage.setItem('puntosGanadosUltimoPedido', puntosGanados.toString());
      }

      //const response = await conector.imprimirEn("PrintApp");
      const response = await conector.imprimirEnImpresoraRemota("Comanda", "http://192.168.88.252:8000" + "/imprimir");

      // Si el cliente está logueado, registrar bonificación para sumar puntos por el pedido
      this.registrarBonificacionCliente();

      // Si la impresión fue exitosa, descontar puntos inmediatamente
      this.descontarPuntosPorCanjes();

      // Preparar los datos del ticket (pedido)
      const datosTicket = {
        pedidoId: this.code,  // Identificador único
        detalles: JSON.stringify(
          this.orderList.map(product => ({
            nombre: product.Nombre,
            cantidad: product.Cantidad,
            precioUnitario: product.Precio,
            complementos: product.Complementos?.map(complemento => ({
              nombre: complemento.Nombre,
              precio: complemento.Precio
            })) || []
          }))
        ),
        total: this.totalCost.toFixed(2)  // Total del pedido
      };

      // Intentar guardar el ticket (no bloqueante, solo informativo)
      this.ticketsService.enviarTicket(datosTicket).subscribe(
        (response) => {
          console.log('Ticket guardado exitosamente', response);
        },
        (error) => {
          console.warn('No se pudo guardar el ticket en BD:', error);
          // No mostramos error al usuario porque ya imprimió correctamente
        }
      );

      // Limpiar y navegar inmediatamente después de imprimir
      localStorage.removeItem('codigo');
      this.orderService.clearOrder();
      this.router.navigate([`${this.code}/pedido-enviado`]);

    } catch (error) {
      console.error('Error al imprimir el ticket:', error);
      this.showAlert('Error de Impresión', '¡Ups! Ha habido algún problema, vuelve a intentarlo.');
      return; // CRÍTICO: Detener ejecución si falla la impresión
    } finally {
      this.isSending = false;
    }
  }

  private async validateAccessContext(): Promise<void> {
    const routeCode = this.code;
    const routeTimestamp = this.timestamp;

    const expectedCode = this.getExpectedMesaCode();

    const isCodeValid = !!routeCode && !!expectedCode && routeCode === expectedCode;
    const timestampMs = routeTimestamp ? this.decodeRouteTimestamp(routeTimestamp) : null;
    const isTimestampValid = timestampMs !== null && Date.now() - timestampMs <= this.ACCESS_EXPIRATION_MS;

    const isValid = isCodeValid && isTimestampValid;
    const changed = this.isAccessContextValid !== isValid;
    this.isAccessContextValid = isValid;

    if (!isValid) {
      await this.showAlert(
        'Sesión Expirada',
        'Tu sesión ha expirado. Por favor, escanea de nuevo el código QR y realiza un nuevo pedido.'
      );
    }
  }

  private getExpectedMesaCode(): string | null {
    const guardCode = localStorage.getItem('codigoMesaGuardado');
    if (guardCode) {
      return guardCode;
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      return null;
    }

    const parts = sessionId.split('_');
    return parts.length > 0 ? parts[0] : null;
  }

  private decodeRouteTimestamp(encodedTimestamp: string): number | null {
    try {
      const padded = encodedTimestamp + '='.repeat((4 - (encodedTimestamp.length % 4)) % 4);
      const decoded = atob(padded);
      const isoMatch = decoded.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      if (!isoMatch) {
        return null;
      }

      const timeMs = Date.parse(isoMatch[0]);
      return Number.isNaN(timeMs) ? null : timeMs;
    } catch {
      return null;
    }
  }


  registrarBonificacionCliente(): void {
    const clienteId = localStorage.getItem('userId');
    if (!clienteId || !this.code) {
      return;
    }

    this.clientesService.registrarBonificacion(
      parseInt(clienteId, 10),
      this.code,
      this.totalCost,
      `Pedido mesa ${this.code}`
    ).subscribe(
      (response: any) => {
        console.log('Bonificación registrada:', response);
        if (response && response.puntos_ganados !== undefined) {
          localStorage.setItem('puntosGanadosUltimoPedido', response.puntos_ganados.toString());
        }
      },
      (error: any) => {
        console.error('Error al registrar bonificación:', error);
      }
    );
  }



  descontarPuntosPorCanjes(): void {
    const canjesStr = localStorage.getItem('canjesPendientes');
    if (!canjesStr) {
      return; // No hay canjes pendientes
    }

    const canjes = JSON.parse(canjesStr);
    if (canjes.length === 0) {
      return;
    }

    const clienteId = localStorage.getItem('userId');
    if (!clienteId) {
      console.warn('No se encontró ID de cliente para descontar puntos');
      return;
    }

    // Calcular total de puntos a descontar
    const totalPuntos = canjes.reduce((sum: number, canje: any) => sum + canje.puntos, 0);

    // Crear detalle de canjes
    const detalles = canjes.map((c: any) => c.nombre).join(', ');

    // Descontar puntos en el servidor
    this.clientesService.descontarPuntos(
      parseInt(clienteId),
      totalPuntos,
      `Canjes: ${detalles}`
    ).subscribe(
      (response) => {
        console.log('Puntos descontados:', response);
        // Limpiar canjes pendientes
        localStorage.removeItem('canjesPendientes');
      },
      (error) => {
        console.error('Error al descontar puntos:', error);
        // No bloqueamos el flujo si falla el descuento
      }
    );
  }

}
