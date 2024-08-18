import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeladeriaPage } from './heladeria.page';

const routes: Routes = [
  {
    path: '',
    component: HeladeriaPage
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HeladeriaPageRoutingModule {}
