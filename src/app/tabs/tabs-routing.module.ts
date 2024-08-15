import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'heladeria',
        loadChildren: () => import('../paginasPrincipales/heladeria/heladeria.module').then(m => m.HeladeriaPageModule)
      },
      {
        path: 'kiosco',
        loadChildren: () => import('../paginasPrincipales/kiosco/kiosco.module').then(m => m.KioscoPageModule)
      },
      {
        path: 'rss',
        loadChildren: () => import('../paginasPrincipales/rss/rss.module').then(m => m.RssPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/heladeria',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/heladeria',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
