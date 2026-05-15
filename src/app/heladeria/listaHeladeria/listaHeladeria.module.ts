import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RouterModule, Routes } from '@angular/router';
import { ListaHeladeriaPage } from './listaHeladeria.page';


const routes: Routes = [
  {
    path: '',
    component: ListaHeladeriaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ListaHeladeriaPage]
})
export class ListaHeladeriaPageModule {}
