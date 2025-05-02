import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../Services/loading.service'; // Servicio de loading

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     // Verificar si es una solicitud de WebSocket (por ejemplo, contiene "ws" o "socket")
     const isWebSocketRequest = request.url.includes('notificacion') || request.url.startsWith('ws://') || request.url.startsWith('wss://');

     if (isWebSocketRequest) {
      //  console.log('Solicitud WebSocket excluida del interceptor:', request.url);
       return next.handle(request); // Ignorar esta solicitud
     }

     // Mostrar indicador de carga para todas las demás solicitudes
    this.loadingService.show(); // Mostrar el indicador de carga
    return next.handle(request).pipe(
      finalize(() => this.loadingService.hide()) // Ocultar el indicador de carga
    );
  }
}
