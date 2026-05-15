import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromosHeladeriaPage } from './promos-heladeria.page';

const routes: Routes = [
  {
    path: '',
    component: PromosHeladeriaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromosHeladeriaPageRoutingModule {}
