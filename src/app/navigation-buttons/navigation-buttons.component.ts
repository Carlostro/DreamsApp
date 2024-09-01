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
  code: string = ''; // Definir la propiedad code

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
}
