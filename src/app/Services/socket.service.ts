import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const baseURL = environment.socket_url;

@Injectable({
  providedIn: 'root', // Esto lo registra automáticamente en el módulo raíz
})
export class SocketService {
  private socket: Socket; // Aquí se asegura que sea de tipo Socket

  constructor() {
    // Configura la conexión al servidor WebSocket
    this.socket = io(baseURL); // Cambia la URL según tu backend
    this.socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
    });
  }

 // Escuchar notificaciones en tiempo real
 onNotification(): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('notificacion', (data) => {
      observer.next(data);
    });
  });
}

// Escuchar actualizaciones automáticas
onUpdate(): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('update', (data) => {
      observer.next(data);
    });
  });
}

// Desconectar el socket
disconnect(): void {
  if (this.socket) {
    this.socket.disconnect();
  }
}
}
