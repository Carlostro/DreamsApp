import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-heladeria',
  templateUrl: './heladeria.page.html',
  styleUrls: ['./heladeria.page.scss'],
})
export class HeladeriaPage implements OnInit {
  code: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    });

  }
}

