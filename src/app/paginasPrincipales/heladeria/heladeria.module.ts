import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeladeriaPage } from './heladeria.page';
import { ExploreContainerComponentModule } from 'src/app/explore-container/explore-container.module';

import { HeladeriaPageRoutingModule } from './heladeria-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    HeladeriaPageRoutingModule
  ],
  declarations: [HeladeriaPage]
})
export class HeladeriaPageModule {}
