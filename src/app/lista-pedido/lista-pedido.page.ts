import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import ConectorPluginV3 from '../ConectorPluginV3';
import { CodigoMesaGuard } from '../guards/codigo-mesa.guard';
import { Router } from '@angular/router';
import { TimestampService } from '../services/timestamp.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-lista-pedido',
  templateUrl: './lista-pedido.page.html',
  styleUrls: ['./lista-pedido.page.scss'],
})
export class ListaPedidoPage implements OnInit {
  orderList: Product[] = [];
  totalCost: number = 0;
  code: string | null = null;
  timestamp: string | null = null;
  timestampActual: string | null = null;
  isCodeValid: boolean = true;
  savedTimestamp: string = '';
  savedRandomString: string = '';
  expirationTime: number = 15 * 60 * 1000; // 15 minuto en milisegundos
  isSending: boolean = false;

  constructor(
    private orderService: OrderService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private codigoMesaGuard: CodigoMesaGuard,
    private router: Router,
    private timestampService: TimestampService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code');
      this.timestamp = params.get('timestamp');
      this.timestampActual = Date.now().toString();
      console.log('Timestamp inicializado:', this.timestampActual);
      this.compareCodes();
    });

    this.loadOrderList();
  }

  getSavedCode(): string | null {
    return localStorage.getItem('codigoMesaGuardado');
  }

  getSavedTimestamp(): string | null {
    return localStorage.getItem('timestampGuardado');
  }

  getSavedRandomString(): string | null {
    return localStorage.getItem('randomStringGuardado');
  }

  async compareCodes(): Promise<void> {
    const savedCode = this.getSavedCode();
    const savedTimestamp = this.getSavedTimestamp();
    const savedRandomString = this.getSavedRandomString();

    if (this.code !== savedCode) {
        this.isCodeValid = false;
        await this.showAlert('Código Modificado', 'El código de la URL ha sido modificado, cierre la app y vuelva a escanear el código QR. 😢');
    } else if (savedTimestamp && savedRandomString) {
        // Decodificar el timestamp guardado
        const decodedString = atob(savedTimestamp);
        const decodedTimestampString = decodedString.split(savedRandomString)[0];
        const decodedTimestamp = parseInt(decodedTimestampString, 10);

        // Asegúrate de que this.timestampActual no sea null
        const currentTimestamp = this.timestampActual ? parseInt(this.timestampActual, 10) : NaN;

        // Convertir timestamps a fechas legibles
        const decodedDate = new Date(decodedTimestamp);
        const currentDate = new Date(currentTimestamp);

        console.log('Timestamp guardado decodificado:', decodedTimestampString);
        console.log('Fecha decodificada:', decodedDate.toLocaleString()); // Formato legible del timestamp guardado
        console.log('Timestamp actual:', currentTimestamp);
        console.log('Fecha actual:', currentDate.toLocaleString()); // Formato legible del timestamp actual

        // Verifica si currentTimestamp es un número válido
        if (isNaN(currentTimestamp)) {
            console.error('Timestamp actual es inválido');
            this.isCodeValid = false;
            await this.showAlert('Error de Timestamp', 'El timestamp actual es inválido. 😢');
        } else {
            const isTimestampValid = decodedTimestamp + this.expirationTime >= currentTimestamp;

            if (!isTimestampValid) {
                this.isCodeValid = false;
                await this.showAlert('Sesión Caducada', 'La sesión ha caducado, cierre la app y vuelva a escanear el código QR. 😢');
            } else {
                this.isCodeValid = true;
            }
        }
    } else {
        this.isCodeValid = true;
    }
}




  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
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
    if (this.isSending) {
      return; // Si ya se está enviando, no hacer nada
    }

    this.isSending = true; // Deshabilitar el botón de enviar

    // Crear un nuevo objeto conector para cada impresión
    const conector = new ConectorPluginV3();

    console.log('Imprimir pedido');
    const codigoMesa = this.code; // Código de la mesa recogido de la URL
    const fechaHoy = new Date();
    const fecha = fechaHoy.toLocaleDateString();
    const hora = fechaHoy.toLocaleTimeString();

    conector
      .Iniciar()
      .Corte(0)
      .EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
      .Feed(1)
      .CargarImagenLocalEImprimir("C:/Users/carlo/Desktop/Dreams/DreamsApp/src/assets/logo ticket.png", 0, 0)
      .Feed(1)
      .Iniciar()
      .EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
      .EscribirTexto(`DON VITE S.L}\n`)
      .EscribirTexto(`CIF B97074843}\n`)
      .EscribirTexto(`PLAZA MAYOR 58\n`)
      .EscribirTexto(`ALZIRA\n`)
      .EscribirTexto(`DreamsApp           Mesa: ${codigoMesa}\n`)
      .EscribirTexto(`Fecha: ${fecha} Hora: ${hora}\n`)
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

      //Ajustamos el nombre del producto si emas largo de 22 letras
      let nombre = product.Nombre || ''; // Asegurarse de que el nombre no sea undefined
      if (nombre.length > maxNombreLength) {
        nombre = nombre.substring(0, maxNombreLength); // Recortar el nombre si es mayor a maxNombreLength
      }
      // Rellenar el nombre hasta 22 caracteres con espacios si no ocupa 22 letras
      if (nombre.length < 22) {
        let rellenaHuecoNombre = 22 - nombre.length;
        nombre = nombre.padEnd(nombre.length + rellenaHuecoNombre, ' ');
    }

      const nombreFormateado = nombre.padEnd(columnaNombre, ' ');

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
    conector.EstablecerTamañoFuente(2,2);
    conector.EscribirTexto(`\nTotal: ${totalLista.toFixed(2)}\n`);

    conector.EscribirTexto("\n");
    conector.EscribirTexto("\n");
    conector.EscribirTexto("\n");
    conector.EscribirTexto("\n");
    conector.EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
    conector.EstablecerTamañoFuente(1,1);
    conector.EscribirTexto("Gracias por su visita\n");

    conector.Corte(80);

    try {
      const response = await conector.imprimirEn("PrintApp");

      // Obtener la fecha y hora actual
      const fechaHora = new Date().toLocaleString();
      // Preparar los datos para escribir en el archivo
      const datos = `Número de Mesa: ${codigoMesa}\nHora: ${fechaHora}\nImporte Total: ${this.totalCost.toFixed(2)}\n`;
      // Escribir los datos en el archivo
      this.fileService.writeToFile('datos_envio.txt', datos).subscribe(
        () => {
          console.log('Datos enviados al servidor para guardar en el archivo');
        },
        (error) => {
          console.error('Error al enviar los datos al servidor:', error);
        }
      );

    // Guardar la hora del último pedido en localStorage
    //Restriccion de pedido continuos
    localStorage.setItem(`ultimoPedido_${codigoMesa}`, new Date().toISOString());

      this.orderService.clearOrder();
      this.router.navigate([`${codigoMesa}/pedido-enviado`]);
  } catch (error) {
      // Manejar el error de impresión
      console.error('Error al imprimir el pedido:', error);
      this.showAlert('Error de Impresión', '¡Ups! Ha habido algún problema, vuelve a intentarlo.');
  } finally {
    this.isSending = false;
}
}

}
