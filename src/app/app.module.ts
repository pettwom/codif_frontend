import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app.routes';
import {DialogModule} from 'primeng/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DataTablesModule} from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-buttons';

import {AppNotfoundComponent} from './pages/app.notfound.component';
import {AppMainComponent} from './app.main.component';
import {AppComponent} from './app.component';

/************************ */
import {HomeComponent} from './pages/home/home.component';
import {LoginComponent} from './pages/login/login.component';
import {environment} from 'src/environments/environment';

import {ErrorInterceptor} from './Services/ErrorInterceptor';
import {WebcamModule} from 'ngx-webcam';
import {TooltipModule} from 'primeng/tooltip';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {SafePipe} from './safe.pipe'; // Corregido aquí
import {Moment} from 'moment';

import {NgxDropzoneModule} from 'ngx-dropzone';
import {NotificacionesComponent} from './pages/notificaciones/notificaciones.component';
import {SocketService} from './Services/socket.service'; // Asegúrate de importar el servicio
import {LoadingInterceptor} from './interceptors/loading.interceptor';
import {CatalogosComponent} from './pages/diccionarios/catalogos/catalogos.component';
import {CorrectoresComponent} from './pages/diccionarios/correctores/correctores.component';
import {ClasificadoresComponent} from './pages/diccionarios/clasificadores/clasificadores.component';
import {FrecuenciaComponent} from './pages/frecuencia/frecuencia.component';
import {AutomaticasComponent} from './pages/automaticas/automaticas.component';
import {RolesComponent} from './pages/administracion/roles/roles.component';
// Importar
import {RolesAsignacionComponent} from './pages/asignacion/roles-asignacion/roles-asignacion.component';
import { AsistidasComponent } from './pages/codificacion/asistidas/asistidas.component';
import { CodautomaticaComponent } from './pages/codificacion/codautomatica/codautomatica.component';
import { FiltrosComponent } from './pages/shared/filtros/filtros.component';
// import {TokenInterceptor} from "./interceptors/token.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    AppMainComponent,
    AppNotfoundComponent,
    /**************** */
    HomeComponent,
    LoginComponent,
    SafePipe,
    NotificacionesComponent,
    CatalogosComponent,
    CorrectoresComponent,
    ClasificadoresComponent,
    FrecuenciaComponent,
    AutomaticasComponent,
    RolesComponent,
    // Declarar el componente
    RolesAsignacionComponent,
    AsistidasComponent,
    CodautomaticaComponent,
    FiltrosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule,
    WebcamModule,
    TooltipModule,
    NgxDropzoneModule,
    RouterModule.forRoot([]), // Aquí se configura el enrutamiento
    NgMultiSelectDropDownModule.forRoot(),

],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
    ],
  exports:[FiltrosComponent],

  bootstrap: [AppComponent]
})
export class AppModule {
}
