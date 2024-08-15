import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductKioscoPageRoutingModule } from './product-kiosco-routing.module';

import { ProductKioscoPage } from './product-kiosco.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductKioscoPageRoutingModule
  ],
  declarations: [ProductKioscoPage]
})
export class ProductKioscoPageModule {}
