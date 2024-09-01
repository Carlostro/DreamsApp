import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pedido-enviado',
  templateUrl: './pedido-enviado.component.html',
  styleUrls: ['./pedido-enviado.component.scss'],
})
export class PedidoEnviadoComponent {
  code: string = '';
  timestamp: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.code = params['code']; // Asegúrate de que el parámetro se llama 'code'
      this.timestamp = params['timestamp'];
    });
  }
}
