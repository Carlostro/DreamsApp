import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromoPuntosPageRoutingModule } from './promo-puntos-routing.module';

import { PromoPuntosPage } from './promo-puntos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PromoPuntosPageRoutingModule
  ],
  declarations: [PromoPuntosPage]
})
export class PromoPuntosPageModule {}
