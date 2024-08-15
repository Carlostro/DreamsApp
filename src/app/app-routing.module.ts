import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'heladeria',
    loadChildren: () => import('./paginasPrincipales/heladeria/heladeria.module').then( m => m.HeladeriaPageModule)
  },
  {
    path: 'kiosco',
    loadChildren: () => import('./paginasPrincipales/kiosco/kiosco.module').then( m => m.KioscoPageModule)
  },
  {
    path: 'contacto',
    loadChildren: () => import('./paginasPrincipales/rss/rss.module').then( m => m.RssPageModule)
  },
  {
    path: 'rss',
    loadChildren: () => import('./paginasPrincipales/rss/rss.module').then( m => m.RssPageModule)
  },
  {
    path: 'product-heladeria',
    loadChildren: () => import('./cartasProductos/cartaHeladeria/product-heladeria.module').then( m => m.ProductHeladeriaPageModule)
  },
  {
    path: 'product-kiosco',
    loadChildren: () => import('./cartasProductos/cartaKiosco/product-kiosco.module').then( m => m.ProductKioscoPageModule)
  },
  {
    path: 'lista-pedido',
    loadChildren: () => import('./lista-pedido/lista-pedido.module').then( m => m.ListaPedidoPageModule)
  },

  { path: 'cervezas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule) },


  {
    path: 'refrescos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'vinos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'polos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'ginebras',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'cafe',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'bolleria',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'copas-helado',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'granizados',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'snacks',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'cubatas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'batido-helado',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'zumos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },
  {
    path: 'smoothies',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then( m => m.ListaHeladeriaPageModule)
  },


  //Parte del Kiosco
  {
    path: 'frutos-secos',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'bolleria',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'golosinas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'caramelos',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'bebidas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'juguetes',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'polos2',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'galletas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },
  {
    path: 'prensa',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then( m => m.ListaKioscoPageModule)
  },



];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
