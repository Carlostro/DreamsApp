import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationButtonsModule } from 'src/app/navigation-buttons/navigation-buttons.module';
import { RssPageRoutingModule } from './rss-routing.module';

import { RssPage } from './rss.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RssPageRoutingModule,
    NavigationButtonsModule
  ],
  declarations: [RssPage]
})
export class RssPageModule {}
