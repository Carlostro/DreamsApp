import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaPedidoPage } from './lista-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: ListaPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaPedidoPageRoutingModule {}
