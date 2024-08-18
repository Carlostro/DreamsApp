import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import ConectorPluginV3 from '../ConectorPluginV3';

const conector = new ConectorPluginV3();

@Component({
  selector: 'app-lista-pedido',
  templateUrl: './lista-pedido.page.html',
  styleUrls: ['./lista-pedido.page.scss'],

})
export class ListaPedidoPage implements OnInit {
  orderList: Product[] = [];
  totalCost: number = 0;
  code: string | null = null;
  isCodeValid: boolean = true;

  constructor(
    private orderService: OrderService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    this.compareCodes();
    });

    this.loadOrderList();
  }

  getSavedCode(): string | null {
    return localStorage.getItem('codigoMesaGuardado');
  }

  async compareCodes(): Promise<void> {
    const savedCode = this.getSavedCode();
    if (this.code !== savedCode) {
      this.isCodeValid = false;
      await this.showAlert();
    } else {
      this.isCodeValid = true;
    }
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Código Modificado',
      message: 'El código de la URL ha sido modificado, cierre la app y vuelva a empezar. 😢',
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

  calculateTotalCost(): void {
    this.totalCost = this.orderList.reduce((total, product) => total + (product.Cantidad * product.Precio), 0);
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
  printOrder() {
    const codigoMesa = this.code; // Código de la mesa recogido de la URL
    const fechaHoy = new Date();
    const fecha = fechaHoy.toLocaleDateString();
    const hora = fechaHoy.toLocaleTimeString();

    conector
      .Iniciar()
      .EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
      //.CargarImagenLocalEImprimir("C:/Users/carlo/Desktop/Dreams/DreamsApp/src/assets/logo ticket.png", ConectorPluginV3.TAMAÑO_IMAGEN_NORMAL, 200)

      .EscribirTexto(`DreamsApp           Mesa: ${codigoMesa}\n`)
      .EscribirTexto(`Fecha: ${fecha} Hora: ${hora}\n`)
      .EscribirTexto("----------------------------------------\n")
      .EscribirTexto("Unid  Descripcion       Precio   Importe\n")
      .EscribirTexto("----------------------------------------\n");

    let totalLista = 0;

    this.orderList.forEach(product => {
      const totalProducto = product.Cantidad * product.Precio;
      totalLista += totalProducto;

      // Formatear la línea para que el nombre del producto comience desde el mismo punto
      const cantidad = product.Cantidad.toString().padEnd(3, ' ');
      const nombre = product.Nombre.padEnd(20, ' ');
      const precio = product.Precio.toFixed(2).padStart(1, ' ');
      const importe = totalProducto.toFixed(2).padStart(8, ' ');

      conector.EscribirTexto(
        `${cantidad}${nombre}${precio}${importe}\n`
      );
    });

    conector.EscribirTexto("----------------------------------------\n");
    conector.EstablecerAlineacion(ConectorPluginV3.ALINEACION_DERECHA);
    conector.EstablecerTamañoFuente(2,2);
    conector.EscribirTexto(`\nTotal: ${totalLista.toFixed(2)}\n`);

    conector.imprimirEn("PrintApp");
    conector.CorteParcial();
}
}


