import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-rss',
  templateUrl: './rss.page.html',
  styleUrls: ['./rss.page.scss'],
})
export class RssPage  {
  code: string | null = null;


  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Suscríbete a los cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
    this.code = params.get('code');
    });


  }
}
