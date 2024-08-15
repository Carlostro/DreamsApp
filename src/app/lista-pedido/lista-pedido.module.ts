import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ListaPedidoPageRoutingModule } from './lista-pedido-routing.module';

import { ListaPedidoPage } from './lista-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaPedidoPageRoutingModule
  ],
  declarations: [ListaPedidoPage],

})
export class ListaPedidoPageModule {}
