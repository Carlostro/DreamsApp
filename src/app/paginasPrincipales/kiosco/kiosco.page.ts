import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-kiosco',
  templateUrl: './kiosco.page.html',
  styleUrls: ['./kiosco.page.scss'],
})
export class KioscoPage {
  code: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    });


  }
}
