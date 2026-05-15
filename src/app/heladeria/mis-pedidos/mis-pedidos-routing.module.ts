import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisPedidosPage } from './mis-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: MisPedidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisPedidosPageRoutingModule {}
