import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ProductHeladeriaPageRoutingModule } from './product-heladeria-routing.module';

import { ProductHeladeriaPage } from './product-heladeria.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductHeladeriaPageRoutingModule
  ],
  declarations: [ProductHeladeriaPage]
})
export class ProductHeladeriaPageModule {}
