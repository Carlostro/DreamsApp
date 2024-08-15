import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RssPageRoutingModule } from './rss-routing.module';

import { RssPage } from './rss.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RssPageRoutingModule
  ],
  declarations: [RssPage]
})
export class RssPageModule {}
