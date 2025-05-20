import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService } from 'src/app/Services/services.sevice';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

// Interfaces para tipado
interface Pregunta {
  asignacion_pregunta_id: number;
  seccion_id: number;
  pregunta_id: number;
  numero: string;
  texto: string;
  cantidad_asignada: number;
  total_asignaciones: number;
  fecha_asignacion: string;
  supervisor: string;
  rol_asignacion_id: number;
  rol_turno_asignacion: string;
}

interface Seccion {
  id: number;
  nombre: string;
  preguntas: Pregunta[];
}

@Component({
  selector: 'app-preguntas-operadores',
  templateUrl: './preguntas-operadores.component.html',
  styleUrls: ['./preguntas-operadores.component.css']
})
export class PreguntasOperadoresComponent implements OnInit, OnDestroy {
  // Variables para datos
  datosCodificacion: any = null;
  seccionesFiltradas: Seccion[] = [];

  // Estado UI
  cargando: boolean = false;
  seccionExpandidaId: number | null = null;

  // Filtros
  textoBusqueda: string = '';
  seccionSeleccionada: string = '';

  // Para manejar suscripciones
  private destruir$ = new Subject<void>();

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarPreguntasAsignadas();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  cargarPreguntasAsignadas(): void {
    this.cargando = true;

    this.servicesService.get('/codificacion-asistida/codificador/mis-preguntas')
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
          console.error('Error al cargar preguntas asignadas:', err);
          this.mostrarError('No se pudieron cargar las preguntas asignadas.');
          this.cargando = false;
        }
      });
  }

  obtenerSeccionesFiltradas(): Seccion[] {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return [];
    }

    const seccionesTodas = this.datosCodificacion.data[0].secciones;

    return seccionesTodas.filter((seccion: Seccion) => {
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
        if (seccion.preguntas && seccion.preguntas.some((pregunta: Pregunta) =>
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
  calcularTotalCodificacionesSeccion(seccion: Seccion): number {
    if (!seccion.preguntas) return 0;

    return seccion.preguntas.reduce((total: number, pregunta: Pregunta) => {
      return total + (pregunta.cantidad_asignada || 0);
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

  // Método para ir a la página de codificación
  irACodificacion(pregunta: Pregunta): void {
    this.router.navigate(['/admin/automatica'], {
      queryParams: {
        pregunta_id: pregunta.pregunta_id,
        asignacion_id: pregunta.asignacion_pregunta_id
      }
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

    return this.datosCodificacion.data[0].secciones.map((seccion: Seccion) => seccion.nombre);
  }

  // Obtener el total de preguntas
  get totalPreguntas(): number {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return 0;
    }

    return this.datosCodificacion.data[0].secciones.reduce((total: number, seccion: Seccion) => {
      return total + (seccion.preguntas ? seccion.preguntas.length : 0);
    }, 0);
  }

  // Obtener el total de codificaciones
  get totalCodificaciones(): number {
    if (!this.datosCodificacion || !this.datosCodificacion.data || !this.datosCodificacion.data[0] || !this.datosCodificacion.data[0].secciones) {
      return 0;
    }

    return this.datosCodificacion.data[0].secciones.reduce((total: number, seccion: Seccion) => {
      if (!seccion.preguntas) return total;

      return total + seccion.preguntas.reduce((subtotal: number, pregunta: Pregunta) => {
        return subtotal + (pregunta.cantidad_asignada || 0);
      }, 0);
    }, 0);
  }

  // Formatea la fecha para mostrar
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';

    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
