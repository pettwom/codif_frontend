import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  [x: string]: any;
  constructor(private router:Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error && error.status === 401 && error.error && error.error.message && error.error.message.match(/jwt expired/)) {

          console.error('El token ha expirado. Debes iniciar sesión nuevamente.');
          Swal.fire({
            title: 'Error',
            icon: 'error',
            text: 'La Sesión expiro, ingrese nuevamente con su usuarios'
          })
          this.router.navigate(['login']);
        }
        return throwError(error);
      })
    );
  }
}
