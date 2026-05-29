// Popup base para Tardeo (no habilitado)
// Importa y usa en la home cuando lo actives
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TardeoProduct } from './tardeo.model';

@Component({
  selector: 'app-tardeo-popup',
  templateUrl: './tardeo-popup.component.html',
  styleUrls: ['./tardeo-popup.component.scss']
})
export class TardeoPopupComponent {
  @Input() producto: TardeoProduct | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() pedir = new EventEmitter<void>();
}
