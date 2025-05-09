// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Router } from '@angular/router';
// import { environment } from 'src/environments/environment';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = environment.base_url;
//   private usuarioActualSubject: BehaviorSubject<any>;
//   public usuarioActual: Observable<any>;
//
//   // Jerarquía de roles
//   private jerarquia = {
//     'ADMINISTRADOR': ['ESPECIALISTA', 'JEFE DE TURNO', 'SUPERVISOR', 'CODIFICADOR'],
//     'ESPECIALISTA': ['JEFE DE TURNO'],
//     'JEFE DE TURNO': ['SUPERVISOR'],
//     'SUPERVISOR': ['CODIFICADOR'],
//     'CODIFICADOR': []
//   };
//
//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {
//     // Intentar obtener información del usuario desde el localStorage
//     let usuario = null;
//     const usuarioStr = localStorage.getItem('users');
//
//     if (usuarioStr) {
//       try {
//         usuario = JSON.parse(usuarioStr);
//       } catch (e) {
//         console.error('Error al parsear usuario del localStorage:', e);
//       }
//     }
//
//     this.usuarioActualSubject = new BehaviorSubject<any>(usuario);
//     this.usuarioActual = this.usuarioActualSubject.asObservable();
//   }
//
//   public get usuarioValue(): any {
//     return this.usuarioActualSubject.value;
//   }
//
//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }
//
//   getTipoUsuario(): string {
//     // Intentar obtener del BehaviorSubject primero
//     const usuario = this.usuarioValue;
//     if (usuario && usuario.tipo_usuario) {
//       return usuario.tipo_usuario;
//     }
//
//     // Si no está disponible, intentar obtener del localStorage directamente
//     try {
//       const usuarioStr = localStorage.getItem('users');
//       if (usuarioStr) {
//         const usuario = JSON.parse(usuarioStr);
//         return usuario.tipo_usuario || '';
//       }
//     } catch (e) {
//       console.error('Error al obtener tipo de usuario:', e);
//     }
//
//     return '';
//   }
//
//   getRolesVisibles(): string[] {
//     const tipoUsuario = this.getTipoUsuario();
//     return this.jerarquia[tipoUsuario] || [];
//   }
//
//   puedeVerRol(rol: string): boolean {
//     const tipoUsuario = this.getTipoUsuario();
//
//     // Administrador puede ver todos los roles
//     if (tipoUsuario === 'ADMINISTRADOR') {
//       return true;
//     }
//
//     // Otros usuarios solo pueden ver los roles definidos en la jerarquía
//     const rolesVisibles = this.jerarquia[tipoUsuario] || [];
//     return rolesVisibles.includes(rol);
//   }
//
//   puedeFuncion(funcion: string): boolean {
//     const tipoUsuario = this.getTipoUsuario();
//
//     switch (funcion) {
//       case 'asignacion_masiva':
//         // Solo administrador y especialista pueden hacer asignación masiva
//         return tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'ESPECIALISTA';
//       case 'ver_historial':
//         // Todos pueden ver historial
//         return true;
//       default:
//         return false;
//     }
//   }
//
//   guardarUsuario(userData: any): void {
//     if (userData) {
//       localStorage.setItem('users', JSON.stringify(userData));
//       this.usuarioActualSubject.next(userData);
//     }
//   }
//
//   logout(): void {
//     localStorage.removeItem('token');
//     localStorage.removeItem('users');
//     localStorage.removeItem('menu');
//     this.usuarioActualSubject.next(null);
//     this.router.navigate(['/login']);
//   }
// }
