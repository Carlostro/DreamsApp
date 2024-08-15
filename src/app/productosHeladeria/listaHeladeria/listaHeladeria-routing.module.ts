import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaHeladeriaPage } from '../listaHeladeria/listaHeladeria.page';

const routes: Routes = [
  {
    path: '',
    component: ListaHeladeriaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaHeladeriaPageRoutingModule {}
