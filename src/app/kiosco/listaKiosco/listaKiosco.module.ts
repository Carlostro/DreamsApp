import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RouterModule, Routes } from '@angular/router';
import { ListaKioscoPage } from './listaKiosco.page';

const routes: Routes = [
  {
    path: '',
    component: ListaKioscoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ListaKioscoPage]
})
export class ListaKioscoPageModule {}
