import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navigation-buttons',
  templateUrl: './navigation-buttons.component.html',
  styleUrls: ['./navigation-buttons.component.scss']
})
export class NavigationButtonsComponent implements OnInit {
  @Input() activePage: string = '';
  @Input() timestamp: string | null = null;
  code: string = ''; 

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Obtener el parámetro 'code' de la URL
    this.route.paramMap.subscribe(params => {
      this.timestamp = params.get('timestamp') || '';
      this.code = params.get('code') || '';

    });
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  //Controlamos el horario que se puede acceder al kiosco
  isKioscoAvailable(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= 8 && currentHour < 21;
  }
}

