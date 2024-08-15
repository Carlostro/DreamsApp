import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KioscoPage } from './kiosco.page';
import { ExploreContainerComponentModule } from 'src/app/explore-container/explore-container.module';

import { KioscoPageRoutingModule } from './kiosco-routing.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    KioscoPageRoutingModule
  ],
  declarations: [KioscoPage]
})
export class KioscoPageModule {}
