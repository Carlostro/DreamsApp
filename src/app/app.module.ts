import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodigoMesaGuard } from './guards/codigo-mesa.guard';


import { LoginUsersComponent } from './login-users/login-users.component';
import { RegistroComponent } from './registro/registro.component';
import { PedidoEnviadoComponent } from './heladeria/pedido-enviado/pedido-enviado.component';
import { ProductService } from './services/product.service';
import { ComplementoService } from './services/complemento.service';
import { PaginaLoadingComponent } from './pagina-loading/pagina-loading.component';
import { TimestampService } from './services/timestamp.service';
import { FileService} from './services/file.service';
import { AppExitService } from './services/app-exit.service';
import { TicketsService } from './services/tickets.service';
import { ClientesService } from './services/clientes.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginUsersComponent,
    RegistroComponent,
    PedidoEnviadoComponent,
    PaginaLoadingComponent
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
        ComplementoService,
        TimestampService,
        FileService,
        TicketsService,
        ClientesService,
        AppExitService ],
  bootstrap: [AppComponent],
})
export class AppModule {}

