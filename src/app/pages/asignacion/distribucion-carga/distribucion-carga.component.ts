import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ServicesService } from 'src/app/Services/services.sevice';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

declare var bootstrap: any;

// interface Usuario {
//   codificador_id: number;
//   asignacion_id: number;
//   seleccionado?: boolean;
// }

interface Usuario {
  aut_id_usuario: number;
  aut_us_usuario: string;
  aut_us_nombres: string;
  aut_us_paterno: string;
  aut_us_materno: string;
  aut_us_ci: string;
  per_correo_electronico: string;
  aut_us_rol: number;
  rol: string;
  aut_us_estado: number;
  id_asignacion: number;
  fecha_asignacion: string;
  turno: string;
  codigo_rol: string;
  nombre_rol: string;
  tiene_preguntas_asignadas: false,
  cantidad_preguntas_asignadas: 0,
  total_codificaciones_asignadas: 0
  seleccionado?: boolean;
}

interface Turno {
  turno: string;
  usuarios: Usuario[];
  total: number;
}

// Nuevas interfaces para manejar la distribución de carga
interface DistribucionCarga {
  usuario: Usuario;
  nombre: string;  // Nombre para mostrar
  cantidad: number; // Cantidad asignada
}

@Component({
  selector: 'app-distribucion-carga',
  templateUrl: './distribucion-carga.component.html',
  styleUrls: ['./distribucion-carga.component.css']
})
export class DistribucionCargaComponent implements OnInit, OnDestroy {
  // Variables para datos
  datosCodificacion: any = null;
  seccionesFiltradas: any[] = [];

  // Estado UI
  cargando: boolean = false;
  seccionExpandidaId: number | null = null;

  // Filtros
  textoBusqueda: string = '';
  seccionSeleccionada: string = '';

  // Modal de asignación
  modalAsignarPregunta: any;
  preguntaSeleccionada: any = null;
  seccionSeleccionadaParaAsignar: any = null;

  // Datos para asignación
  turnos: Turno[] = [];
  turnoSeleccionado: string = '';
  usuariosFiltrados: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  codificadoresSeleccionados: Usuario[] = []; // Nueva propiedad para almacenar múltiples selecciones
  distribucionCalculada: DistribucionCarga[] = []; // Nueva propiedad para la distribución

  // Para manejar suscripciones
  private destruir$ = new Subject<void>();

  constructor(
    private servicesService: ServicesService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  // Métodos actualizados para la selección de múltiples usuarios
  isUsuarioSeleccionado(usuario: Usuario): boolean {
    return this.codificadoresSeleccionados.some(u => u.aut_id_usuario === usuario.aut_id_usuario);
  }

  // Método para calcular la distribución de carga
  calcularDistribucionCarga(): void {
    if (!this.preguntaSeleccionada || this.codificadoresSeleccionados.length === 0) {
      this.distribucionCalculada = [];
      return;
    }

    const totalCodificaciones = this.preguntaSeleccionada.total_codificaciones || 0;
    const cantidadCodificadores = this.codificadoresSeleccionados.length;

    // Calcular el valor base que cada codificador recibirá
    const baseAsignacion = Math.floor(totalCodificaciones / cantidadCodificadores);

    // Calcular cuántos codificadores recibirán una asignación adicional para compensar
    const asignacionesAdicionales = totalCodificaciones % cantidadCodificadores;

    // Crear la distribución
    this.distribucionCalculada = this.codificadoresSeleccionados.map((usuario, index) => {
      // Los primeros 'asignacionesAdicionales' codificadores reciben una unidad extra
      const cantidad = index < asignacionesAdicionales
        ? baseAsignacion + 1
        : baseAsignacion;

      return {
        usuario: usuario,
        nombre: `${usuario.aut_us_nombres} ${usuario.aut_us_paterno}`,
        cantidad: cantidad
      };
    });
  }

  // Calcular el promedio por codificador (para mostrar)
  calcularPromedioPorCodificador(): string {
    if (!this.preguntaSeleccionada || this.codificadoresSeleccionados.length === 0) {
      return '0';
    }

    const totalCodificaciones = this.preguntaSeleccionada.total_codificaciones || 0;
    const cantidadCodificadores = this.codificadoresSeleccionados.length;

    const promedio = totalCodificaciones / cantidadCodificadores;

    // Si es un número entero, mostrar como entero
    if (promedio === Math.floor(promedio)) {
      return promedio.toString();
    }

    // Si es decimal, mostrar con 2 decimales
    return promedio.toFixed(2);
  }

  // Método actualizado para abrir el modal
  abrirModalAsignar(pregunta: any, seccion: any): void {
    // Verificar que la pregunta no esté ya asignada
    if (pregunta.asignacion && pregunta.asignacion.esta_asignada) {
      this.mostrarAlerta('Esta pregunta ya ha sido asignada.', 'info');
      return;
    }

    this.preguntaSeleccionada = pregunta;
    this.seccionSeleccionadaParaAsignar = seccion;
    this.turnoSeleccionado = '';
    this.usuariosFiltrados = [];
    this.codificadoresSeleccionados = []; // Resetear selección múltiple
    this.distribucionCalculada = []; // Resetear distribución

    // Cargar los usuarios disponibles
    this.cargarUsuariosDisponibles();

    // Mostrar el modal
    this.modalAsignarPregunta.show();
  }

  toggleUsuarioSeleccion(usuario: Usuario): void {
    const index = this.codificadoresSeleccionados.findIndex(u => u.aut_id_usuario === usuario.aut_id_usuario);

    if (index === -1) {
      // Agregar usuario a la selección
      this.codificadoresSeleccionados.push(usuario);
    } else {
      // Remover usuario de la selección
      this.codificadoresSeleccionados.splice(index, 1);
    }

    // Recalcular distribución
    this.calcularDistribucionCarga();
  }

  // sdsdsd

  ngOnInit(): void {
    this.cargarDatosCodificacion();
    this.inicializarModales();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  inicializarModales(): void {
    setTimeout(() => {
      const modalEl = document.getElementById('modalAsignarPregunta');
      if (modalEl) {
        this.modalAsignarPregunta = new bootstrap.Modal(modalEl);
      }
    }, 500);
  }

  // Método para volver a la página de asignación
  volverAPaginaAsignacion(): void {
    this.router.navigate(['/admin/asignacion']);
  }

  cargarDatosCodificacion(): void {
    this.cargando = true;

    this.servicesService.get('/codificacion-asistida/CODIFICACION_ASISTIDA')
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          this.datosCodificacion = res;
          if (this.datosCodificacion && this.datosCodificacion.data && this.datosCodificacion.data.length > 0) {
            this.seccionesFiltradas = this.obtenerSeccionesFiltradas();
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar datos de codificación:', err);
          this.mostrarError('No se pudieron cargar los datos de codificación asistida.');
          this.cargando = false;
        }
      });
  }

  obtenerSeccionesFiltradas(): any[] {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return [];
    }

    const seccionesTodas = this.datosCodificacion.data[0].secciones;

    return seccionesTodas.filter((seccion: any) => {
      // Filtro por sección seleccionada
      if (this.seccionSeleccionada && seccion.nombre !== this.seccionSeleccionada) {
        return false;
      }

      // Filtro por texto de búsqueda
      if (this.textoBusqueda) {
        const textoBusquedaLower = this.textoBusqueda.toLowerCase();

        // Verificar si coincide con el nombre de la sección
        if (seccion.nombre.toLowerCase().includes(textoBusquedaLower)) {
          return true;
        }

        // Verificar si coincide con alguna pregunta
        if (seccion.preguntas && seccion.preguntas.some((pregunta: any) =>
          pregunta.texto.toLowerCase().includes(textoBusquedaLower) ||
          (pregunta.numero && pregunta.numero.toString().includes(textoBusquedaLower))
        )) {
          return true;
        }

        return false;
      }

      return true;
    });
  }

  // Toggle para expandir/contraer secciones
  toggleSeccion(seccionId: number): void {
    if (this.seccionExpandidaId === seccionId) {
      // Si la sección ya está expandida, la contraemos
      this.seccionExpandidaId = null;
    } else {
      // Si la sección no está expandida, la expandimos
      this.seccionExpandidaId = seccionId;
    }
  }

  // Para calcular el total de codificaciones para una sección
  calcularTotalCodificacionesSeccion(seccion: any): number {
    if (!seccion.preguntas) return 0;

    return seccion.preguntas.reduce((total: number, pregunta: any) => {
      return total + (pregunta.total_codificaciones || 0);
    }, 0);
  }

  aplicarFiltros(): void {
    this.seccionesFiltradas = this.obtenerSeccionesFiltradas();
    // Resetear sección expandida al aplicar filtros
    this.seccionExpandidaId = null;
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.seccionSeleccionada = '';
    this.seccionesFiltradas = this.obtenerSeccionesFiltradas();
    // Resetear sección expandida al limpiar filtros
    this.seccionExpandidaId = null;
  }

  // Métodos para asignación de preguntas
  abrirModalAsignarOld(pregunta: any, seccion: any): void {
    // Verificar que la pregunta no esté ya asignada
    if (pregunta.asignacion && pregunta.asignacion.esta_asignada) {
      this.mostrarAlerta('Esta pregunta ya ha sido asignada.', 'info');
      return;
    }

    this.preguntaSeleccionada = pregunta;
    this.seccionSeleccionadaParaAsignar = seccion;
    this.turnoSeleccionado = '';
    this.usuariosFiltrados = [];
    this.usuarioSeleccionado = null;

    // Cargar los usuarios disponibles
    this.cargarUsuariosDisponibles();

    // Mostrar el modal
    this.modalAsignarPregunta.show();
  }

  mostrarAlerta(mensaje: string, tipo: 'success' | 'info' | 'warning' | 'error'): void {
    Swal.fire({
      icon: tipo,
      title: tipo === 'success' ? 'Éxito' : tipo === 'error' ? 'Error' : 'Información',
      text: mensaje,
      confirmButtonColor: '#696cff'
    });
  }

  cargarUsuariosDisponibles(): void {
    this.cargando = true;

    this.servicesService.get('/roles/mis-asignaciones')
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          if (res && res.turnos) {
            this.turnos = res.turnos;

            // Inicializar seleccionado = false para todos los usuarios
            this.turnos.forEach(turno => {
              turno.usuarios.forEach(usuario => {
                usuario.seleccionado = false;
              });
            });
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar usuarios disponibles:', err);
          this.mostrarError('No se pudieron cargar los usuarios disponibles.');
          this.cargando = false;
        }
      });
  }

  // Método actualizado para filtrar por turno
  filtrarUsuariosPorTurno(): void {
    this.codificadoresSeleccionados = []; // Limpiar selecciones al cambiar de turno
    this.distribucionCalculada = []; // Resetear distribución

    if (!this.turnoSeleccionado) {
      this.usuariosFiltrados = [];
      return;
    }

    const turnoEncontrado = this.turnos.find(t => t.turno === this.turnoSeleccionado);
    if (turnoEncontrado) {
      this.usuariosFiltrados = [...turnoEncontrado.usuarios];
    } else {
      this.usuariosFiltrados = [];
    }
  }

  seleccionarUsuario(usuario: Usuario): void {
    // Deseleccionar todos los usuarios
    this.usuariosFiltrados.forEach(u => {
      u.seleccionado = false;
    });

    // Seleccionar el usuario actual
    usuario.seleccionado = true;
    this.usuarioSeleccionado = usuario;
  }

  // Método actualizado para asignar preguntas
  asignarPregunta(): void {
    if (!this.preguntaSeleccionada || this.codificadoresSeleccionados.length === 0) {
      this.mostrarError('Debe seleccionar una pregunta y al menos un codificador para realizar la asignación.');
      return;
    }


    // Verificación adicional que la pregunta no esté ya asignada
    if (this.preguntaSeleccionada.asignacion && this.preguntaSeleccionada.asignacion.esta_asignada) {
      this.mostrarAlerta('Esta pregunta ya ha sido asignada.', 'warning');
      this.modalAsignarPregunta.hide();
      return;
    }

    // Calcular la distribución final si no se ha hecho ya
    if (this.distribucionCalculada.length === 0) {
      this.calcularDistribucionCarga();
    }

    Swal.fire({
      title: 'Procesando...',
      html: 'Asignando pregunta, por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Preparar los datos para enviar a la API
    const asignaciones = this.distribucionCalculada.map(dist => {
      return {
        seccion_id: this.seccionSeleccionadaParaAsignar.id,
        pregunta_id: this.preguntaSeleccionada.id,
        total_asignaciones: this.preguntaSeleccionada.total_codificaciones,
        supervisor_id: this.obtenerIdSupervisor(),
        codificador_id: dist.usuario.aut_id_usuario,
        cantidad_asignada: dist.cantidad,
        asignacion_id: dist.usuario.id_asignacion,
        esta_asignada: true
      };
    });

    this.servicesService.post('/codificacion-asistida/asignar-multiples', { asignaciones: asignaciones })
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res) => {
          // Manejar respuesta exitosa
          Swal.close();
          this.actualizarEstadoPregunta();
          this.modalAsignarPregunta.hide();
          this.mostrarMensajeExito();
          // Recargar los datos para reflejar los cambios
          this.cargarDatosCodificacion();
        },
        error: (err) => {
          Swal.close();
          console.error('Error al asignar pregunta:', err);
          this.mostrarError('No se pudo completar la asignación. Por favor, intente nuevamente.');
        }
      });
  }

  obtenerIdSupervisor(): number | null {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró token en localStorage');
      return null;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        throw new Error('Token malformado: falta payload');
      }

      const payloadDecoded = atob(payloadBase64);
      const payload = JSON.parse(payloadDecoded);

      if (!payload?.usuario?.id_usuario) {
        throw new Error('Estructura del token no contiene id_usuario esperado');
      }

      const idUsuario = Number(payload.usuario.id_usuario);
      if (isNaN(idUsuario)) {
        throw new Error('id_usuario no es un número válido');
      }

      return idUsuario;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  // Método para actualizar el estado de la pregunta después de la asignación
  actualizarEstadoPregunta(): void {
    // Construir la lista de nombres de codificadores
    const nombresCodificadores = this.codificadoresSeleccionados
      .map(u => `${u.aut_us_nombres} ${u.aut_us_paterno}`)
      .join(', ');

    if (this.preguntaSeleccionada.asignacion) {
      this.preguntaSeleccionada.asignacion.esta_asignada = true;
      this.preguntaSeleccionada.asignacion.codificadores_asignados = [...this.codificadoresSeleccionados];
      this.preguntaSeleccionada.asignacion.total_asignaciones = this.codificadoresSeleccionados.length;
      this.preguntaSeleccionada.asignacion.cantidad_asignada_activa = this.preguntaSeleccionada.total_codificaciones;
      this.preguntaSeleccionada.asignacion.lista_codificadores = nombresCodificadores;
    } else {
      // Si no existe la propiedad asignacion, la creamos
      this.preguntaSeleccionada.asignacion = {
        esta_asignada: true,
        total_asignaciones: this.codificadoresSeleccionados.length,
        cantidad_asignada_activa: this.preguntaSeleccionada.total_codificaciones,
        total_posibles: this.preguntaSeleccionada.total_codificaciones,
        asignada_a_mi: true,
        mi_cantidad_asignada: this.preguntaSeleccionada.total_codificaciones,
        codificadores_asignados: [...this.codificadoresSeleccionados],
        lista_codificadores: nombresCodificadores
      };
    }
  }

  // Método para mostrar mensaje de éxito después de la asignación
  mostrarMensajeExito(): void {
    const nombresCodificadores = this.distribucionCalculada
      .map(d => `${d.nombre}: ${d.cantidad} codificaciones`)
      .join('<br>');

    Swal.fire({
      icon: 'success',
      title: 'Asignación exitosa',
      html: `
        <p>La pregunta <strong>${this.preguntaSeleccionada.numero || ''}</strong>
        ha sido asignada a ${this.codificadoresSeleccionados.length} codificador(es):</p>
        <div class="text-start mt-3">
          ${nombresCodificadores}
        </div>
        <p class="mt-3">Total: <strong>${this.preguntaSeleccionada.total_codificaciones}</strong> codificaciones</p>
      `,
      confirmButtonColor: '#28c76f'
    });
  }

  mostrarError(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonColor: '#696cff'
    });
  }

  // Obtener la lista de nombres de secciones para el selector
  get nombresSecciones(): string[] {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return [];
    }

    return this.datosCodificacion.data[0].secciones.map((seccion: any) => seccion.nombre);
  }

  // Obtener el total de preguntas
  get totalPreguntas(): number {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return 0;
    }

    return this.datosCodificacion.data[0].secciones.reduce((total: number, seccion: any) => {
      return total + (seccion.preguntas ? seccion.preguntas.length : 0);
    }, 0);
  }

  // Obtener el total de codificaciones
  get totalCodificaciones(): number {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return 0;
    }

    return this.datosCodificacion.data[0].secciones.reduce((total: number, seccion: any) => {
      if (!seccion.preguntas) return total;

      return total + seccion.preguntas.reduce((subtotal: number, pregunta: any) => {
        return subtotal + (pregunta.total_codificaciones || 0);
      }, 0);
    }, 0);
  }

  tienePreguntasAsignadas(seccion: any): boolean {
    if (!seccion.preguntas || seccion.preguntas.length === 0) {
      return false;
    }

    // Verificar si al menos una pregunta de la sección está asignada
    return seccion.preguntas.some(pregunta => pregunta.asignacion && pregunta.asignacion.esta_asignada);
  }

// Método para contar preguntas asignadas en una sección
  contarPreguntasAsignadas(seccion: any): number {
    if (!seccion.preguntas || seccion.preguntas.length === 0) {
      return 0;
    }

    // Contar cuántas preguntas están asignadas
    return seccion.preguntas.filter(pregunta =>
      pregunta.asignacion && pregunta.asignacion.esta_asignada
    ).length;
  }

}
