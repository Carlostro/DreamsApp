import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodigoMesaGuard } from './guards/codigo-mesa.guard';

import { LoginComponent } from './login/login.component';
import { PaginaAdminComponent } from './pagina-admin/pagina-admin.component';
import { ProductService } from './services/product.service';
import { ComplementoService } from './services/complemento.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PaginaAdminComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{
     provide:
        RouteReuseStrategy,
        useClass: IonicRouteStrategy },
        CodigoMesaGuard,
        ProductService,
        ComplementoService],
  bootstrap: [AppComponent],
})
export class AppModule {}

