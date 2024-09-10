import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pedido-enviado',
  templateUrl: './pedido-enviado.component.html',
  styleUrls: ['./pedido-enviado.component.scss'],
})
export class PedidoEnviadoComponent implements OnInit, OnDestroy {
  code: string = '';
  timestamp: string | null = null;
  private apiUrl = 'http://192.168.1.44:3000/active-tables'; // URL de la API REST

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    // Suscribirse a los parámetros de la ruta para obtener el código y el timestamp
    this.route.params.subscribe(params => {
      this.code = params['code']; // Asegúrate de que el parámetro se llama 'code'
      this.timestamp = params['timestamp'];
    });
  }

  ngOnInit() {
    // Eliminar la mesa del array de mesas activas antes de redirigir
    this.removeActiveTable(this.code).subscribe(() => {
      // Redirigir a la página de carga después de 3 segundos
      setTimeout(() => {
        window.location.href = 'https://www.cafeteriadreams.com/';
      }, 3000); // 3000 milisegundos = 3 segundos
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    // Eliminar la mesa del array de mesas activas antes de que la ventana se cierre
    this.removeActiveTable(this.code).subscribe();
  }

  ngOnDestroy() {
    // Eliminar la mesa del array de mesas activas cuando el componente se destruya
    this.removeActiveTable(this.code).subscribe();
  }

  // Método para añadir una mesa al array de mesas activas en el servidor
  private addActiveTable(code: string) {
    return this.http.post(this.apiUrl, { code });
  }

  // Método para eliminar una mesa del array de mesas activas en el servidor
  private removeActiveTable(code: string) {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }

  // Método para verificar si una mesa está ocupada consultando el servidor
  private isTableOccupied(code: string) {
    return this.http.get<string[]>(this.apiUrl).pipe(
      map(activeTables => activeTables.includes(code))
    );
  }
}
