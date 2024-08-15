import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RssPage } from './rss.page';

const routes: Routes = [
  {
    path: '',
    component: RssPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RssPageRoutingModule {}
