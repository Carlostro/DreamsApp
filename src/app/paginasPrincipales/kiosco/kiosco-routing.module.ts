import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KioscoPage } from './kiosco.page';

const routes: Routes = [
  {
    path: '',
    component: KioscoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KioscoPageRoutingModule {}
