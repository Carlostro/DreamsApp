import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from 'src/app/shared/ionic.module';

import { MisPedidosPageRoutingModule } from './mis-pedidos-routing.module';

import { MisPedidosPage } from './mis-pedidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisPedidosPageRoutingModule
  ],
  declarations: [MisPedidosPage]
})
export class MisPedidosPageModule {}
