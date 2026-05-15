import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromoPuntosPage } from './promo-puntos.page';

const routes: Routes = [
  {
    path: '',
    component: PromoPuntosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromoPuntosPageRoutingModule {}
