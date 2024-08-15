import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaKioscoPage } from './listaKiosco.page';

const routes: Routes = [
  {
    path: '',
    component: ListaKioscoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaKioscoPageRoutingModule {}
