import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';

import {AppMainComponent} from './app.main.component';
import {AppComponent} from './app.component';
import {AppNotfoundComponent} from './pages/app.notfound.component';

import {HomeComponent} from './pages/home/home.component';
import {LoginComponent} from './pages/login/login.component';

import {LogoutComponent} from './logout.component';
import {NotificacionesComponent} from './pages/notificaciones/notificaciones.component';
import {CatalogosComponent} from './pages/diccionarios/catalogos/catalogos.component';
import {CorrectoresComponent} from './pages/diccionarios/correctores/correctores.component';
import {ClasificadoresComponent} from './pages/diccionarios/clasificadores/clasificadores.component';
import {FrecuenciaComponent} from './pages/frecuencia/frecuencia.component';
import {AutomaticasComponent} from './pages/automaticas/automaticas.component';
// Importar la ruta
import {RolesAsignacionComponent} from './pages/asignacion/roles-asignacion/roles-asignacion.component';
import { CodautomaticaComponent } from './pages/codificacion/codautomatica/codautomatica.component';

const routes: Routes = [
  {
    path: 'admin', component: AppMainComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: HomeComponent},
      {path: 'noti', component: NotificacionesComponent},
      {path: 'catalogos', component: CatalogosComponent},
      {path: 'correctores', component: CorrectoresComponent},
      {path: 'clasificador', component: ClasificadoresComponent},
      {path: 'frecuencia', component: FrecuenciaComponent},
      {path: 'codificacion', component: AutomaticasComponent},
      // Definir la ruta
      {path: 'asignacion', component: RolesAsignacionComponent},
      {path: 'home', component: HomeComponent},
      {path: 'automatica', component: CodautomaticaComponent},
    ]
  },
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'notfound', component: AppNotfoundComponent},
  {path: '**', redirectTo: '/notfound'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
