import { Component, OnInit, OnDestroy, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var bootstrap: any;
declare var $: any;

import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-roles-asignacion',
  templateUrl: './roles-asignacion.component.html',
  styleUrls: ['./roles-asignacion.component.css']
})
export class RolesAsignacionComponent implements OnInit, OnDestroy {
  // Referencia al DataTable directive para mejor control
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  // Configuración DataTables
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtInstance: any;

  // Variable para rastrear si DataTables se está inicializando
  private tablaInicializando: boolean = false;

  // Flag para almacenar filtros pendientes
  private filtrosPendientes: boolean = false;

  // Lista filtrada para mostrar (esta es la que cambia con los filtros)
  listaUsuariosFiltrada: any[] = [];

  // Datos principales
  listaUsuarios: any[] = [];
  rolesDisponibles: any[] = [];
  rolesActualesUsuario: any[] = [];
  usuarioSeleccionado: any = null;

  // Formularios
  formularioRol: FormGroup;
  formularioRolMasivo: FormGroup;

  // Estado UI
  cargando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // Modales
  modalAsignarRol: any;
  modalAsignacionMasiva: any;

  // Toasts
  toastExito: any;
  toastError: any;

  // Filtros para tabla principal
  textoFiltro: string = '';
  rolFiltro: string = '';
  estadoFiltro: string = '';

  // Filtros para modal
  textoFiltroModal: string = '';
  rolFiltroModal: string = '';
  estadoFiltroModal: string = 'activo'; // Por defecto mostrar solo activos

  // Paginación para modal
  tamanioPaginaModal: number = 10;
  paginaActualModal: number = 1;
  usuariosFiltradosModal: any[] = [];
  usuariosModalPaginados: any[] = [];

  // Filtros disponibles
  filtrosDisponibles: any = {
    roles: []
  };

  // Para matemáticas en el template
  Math: any = Math;

  // Mensajes de la API
  mensajeAPI: string = '';
  mostrarMensajeAPI: boolean = false;
  tipoMensajeAPI: 'success' | 'info' | 'warning' | 'danger' = 'info';
  mensajeAPIPrincipal: string = '';
  mostrarMensajeAPIPrincipal: boolean = false;
  tipoMensajeAPIPrincipal: 'success' | 'info' | 'warning' | 'danger' = 'info';

  // Variables para gestión de selección
  usuariosSeleccionados: any[] = []; // Lista de usuarios seleccionados
  usuariosFiltrados: any[] = []; // Lista de usuarios después de aplicar filtros
  usuariosTotal: any[] = []; // Lista completa de usuarios sin filtrar
  seleccionarTodosActivo: boolean = false;

  // Para limpiar suscripciones
  private destruir$ = new Subject<void>();

  // HISTORIAL
  // Propiedades para el historial de roles

  // Propiedades para el historial de roles
  modalHistorialRoles: any;
  historialRolesUsuario: any[] = [];
  usuarioHistorial: any = null;
  usuarioHistorialId: number = 0;
  filtroHistorial = {
    mostrarActivos: false,
    mostrarInactivos: false
  };

  rolUsuarioActual: string = '';

  constructor(
    private servicesService: ServicesService,
    private fb: FormBuilder
  ) {
    // Inicializar formularios
    this.formularioRol = this.fb.group({
      rol_id: ['', Validators.required],
      turno: ['', Validators.required]
    });

    this.formularioRolMasivo = this.fb.group({
      rol_id: ['', Validators.required],
      turno: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.inicializarOpcionesDatatable();
    this.inicializarModales();
    this.inicializarToasts();
    this.cargarListaUsuarios();
    this.cargarRolesDisponibles();

    this.obtenerRolUsuarioActual();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();

    // Asegurarse de destruir DataTables correctamente
    const tabla = $('#tablaPrincipal').DataTable();
    if (tabla) {
      tabla.destroy();
    }

    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  obtenerRolUsuarioActual(): void {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecoded = atob(payloadBase64);
        const payload = JSON.parse(payloadDecoded);
        this.rolUsuarioActual = payload.usuario.tipo_usuario;
        console.log("Payload: ", payload);
      } catch (error) {
        console.error('Error al obtener rol del usuario:', error);
        this.rolUsuarioActual = '';
      }
    }

    console.log('Rol del usuario actual:', this.rolUsuarioActual);
  }

  inicializarModales(): void {
    // Inicializar después de que el DOM esté listo
    setTimeout(() => {
      this.modalAsignarRol = new bootstrap.Modal(document.getElementById('modalAsignarRol'));
      this.modalAsignacionMasiva = new bootstrap.Modal(document.getElementById('modalAsignacionMasiva'));
      // Nuevo modal para la linea de tiempo
      this.modalHistorialRoles = new bootstrap.Modal(document.getElementById('modalHistorialRoles'));
    });
  }

  inicializarToasts(): void {
    // Esperar un poco para asegurar que el DOM esté listo
    setTimeout(() => {
      // Comprobar si los elementos existen primero
      const toastExitoEl = document.getElementById('toastExito');
      const toastErrorEl = document.getElementById('toastError');

      if (toastExitoEl && toastErrorEl) {
        // Inicializar con opciones específicas para garantizar que se muestren
        this.toastExito = new bootstrap.Toast(toastExitoEl, {
          animation: true,
          autohide: true,
          delay: 5000
        });

        this.toastError = new bootstrap.Toast(toastErrorEl, {
          animation: true,
          autohide: true,
          delay: 5000
        });

        console.log('Toasts inicializados correctamente');
      } else {
        console.error('No se pudieron encontrar los elementos de toast en el DOM');
      }
    }, 500);
  }

  // Método para cargar usuarios
  cargarListaUsuarios(): void {
    this.cargando = true;
    const nombre_corto_nivel = 'Codificación - Cod';

    this.servicesService.get(`/roles/usuarios/${nombre_corto_nivel}`)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          // Guardar lista original
          this.listaUsuarios = (res.roles || []).map(usuario => ({
            ...usuario,
            seleccionado: false
          }));

          // Inicializar lista filtrada con todos los usuarios
          this.listaUsuariosFiltrada = [...this.listaUsuarios];

          // Guardar lista completa para otros usos
          this.usuariosTotal = [...this.listaUsuarios];
          this.usuariosFiltradosModal = [...this.listaUsuarios];

          // Inicializar filtros disponibles
          this.inicializarFiltros();

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          this.mostrarError('No se pudieron cargar los usuarios. Intente nuevamente.');
          this.cargando = false;
        }
      });
  }

  // Filtros
  buscarUsuarios(): void {
    // Llamamos al método aplicarFiltros
    this.aplicarFiltros();
  }

  // Método mejorado para reinicializar DataTables
  reInitDatatable(): void {
    this.tablaInicializando = true;

    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        // Destruir la instancia si existe
        if (dtInstance) {
          dtInstance.destroy();
        }

        // Resetear la instancia
        this.dtInstance = null;

        // Disparar el evento para recrear la tabla
        setTimeout(() => {
          this.dtTrigger.next(null);
          this.cargando = false;
        }, 0);
      }).catch(err => {
        console.error('Error al reinicializar DataTable:', err);
        // Intentar recrear de todos modos
        setTimeout(() => {
          this.dtTrigger.next(null);
          this.cargando = false;
        }, 0);
      });
    } else {
      // Si dtElement no está disponible aún (primera carga)
      setTimeout(() => {
        this.dtTrigger.next(null);
        this.cargando = false;
      }, 0);
    }
  }

  cargarRolesDisponibles(): void {
    // const filtro = 'GSP,JTMT,SUP,COD';
    // this.servicesService.get(`/roles/sistema/${filtro}`)
    // El filtro sera mediante el token
    this.servicesService.get(`/roles/sistema`)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          this.rolesDisponibles = res.roles || [];
        },
        error: (err) => {
          console.error('Error al cargar roles del sistema:', err);
          this.mostrarError('No se pudieron cargar los roles disponibles.');
        }
      });
  }

  cargarRolesActualesUsuario(usuarioId: number): void {
    this.servicesService.get(`/roles/historial/${usuarioId}`)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          this.rolesActualesUsuario = res.asignacionesActuales || [];
        },
        error: (err) => {
          console.error('Error al cargar roles del usuario:', err);
          this.mostrarError('No se pudieron cargar los roles actuales del usuario.');
        }
      });
  }

  abrirModalAsignarRol(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.formularioRol.reset();

    // Resetear mensajes de la API
    this.mostrarMensajeAPI = false;

    // Cargar roles actuales del usuario
    this.cargarRolesActualesUsuario(usuario.aut_id_usuario);

    this.modalAsignarRol.show();
  }

  abrirModalAsignacionMasiva(): void {
    this.usuariosSeleccionados = [];
    this.formularioRolMasivo.reset();

    // Desmarcar todos los usuarios
    this.listaUsuarios.forEach(usuario => usuario.seleccionado = false);

    // Resetear filtros del modal
    this.textoFiltroModal = '';
    this.rolFiltroModal = '';
    this.estadoFiltroModal = 'activo'; // Por defecto mostrar solo activos

    // Inicializar filtrado
    this.usuariosFiltradosModal = [...this.listaUsuarios].filter(u => u.aut_us_estado === 1);

    // Inicializar también los usuarios filtrados para la selección múltiple
    this.usuariosFiltrados = [...this.usuariosFiltradosModal];

    // Inicializar paginación
    this.paginaActualModal = 1;
    this.actualizarUsuariosModalPaginados();

    // Resetear el estado "seleccionar todos"
    this.seleccionarTodosActivo = false;

    this.modalAsignacionMasiva.show();
  }

  // winter
  asignarRol(): void {
    if (this.formularioRol.invalid || !this.usuarioSeleccionado) {
      return;
    }

    const datosFormulario = this.formularioRol.value;
    const rolId = parseInt(datosFormulario.rol_id);

    // Verificar si el rol ya está asignado
    const rolDuplicado = this.rolesActualesUsuario.find(
      rol => rol.rol_id === rolId && rol.activo
    );

    if (rolDuplicado) {
      // Mostrar un mensaje de error
      this.mensajeAPI = `El rol ya está asignado a este usuario. Por favor, seleccione otro rol.`;
      this.tipoMensajeAPI = 'warning';
      this.mostrarMensajeAPI = true;
      return;
    }

    const payload = {
      usuario_id: this.usuarioSeleccionado.aut_id_usuario,
      roles: [{
        rol_id: rolId,
        turno: datosFormulario.turno
      }]
    };

    this.cargando = true;
    this.mostrarMensajeAPI = false; // Ocultar mensaje anterior

    console.log("Payload Asignar", payload);

    let endpoint = '';

    switch (this.rolUsuarioActual) {
      case 'ADMINISTRADOR':
        endpoint = '/roles/asignar';
        break;
      case 'ESPECIALISTA':
        endpoint = '/especialista/roles/asignar';
        break;
      case 'JEFE DE TURNO':
        endpoint = '/jefatura/roles/asignar';
        break;
      case 'SUPERVISOR':
        endpoint = '/supervisor/roles/asignar';
        break;
      default:
        console.warn('Rol no reconocido, usando endpoint de administrador por defecto');
        endpoint = '/roles/asignar';
    }

    console.log(`Usando endpoint: ${endpoint} para rol: ${this.rolUsuarioActual}`);

    this.servicesService.post(endpoint, payload)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          // Capturar el mensaje de la respuesta
          this.mensajeAPI = res.message || 'Rol asignado correctamente';
          this.tipoMensajeAPI = 'success';
          this.mostrarMensajeAPI = true;

          console.log('Mensaje de la API:', this.mensajeAPI);

          // Recargar roles actuales para actualizar la tabla dentro del modal
          this.cargarRolesActualesUsuario(this.usuarioSeleccionado.aut_id_usuario);

          // Resetear formulario para asignar otro rol fácilmente
          this.formularioRol.reset();

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al asignar 2025 rol:', err);

          // Capturar el mensaje de error
          this.mensajeAPI = err.error?.message || 'Error al asignar rol';
          this.tipoMensajeAPI = 'danger';
          this.mostrarMensajeAPI = true;

          // this.cargando = false;
        }
      });
  }

  desactivarRol(asignacionId: number): void {
    // Cerrar el modal principal primero
    this.modalAsignarRol.hide();

    // Pequeño retraso para asegurar que el primer modal se ha cerrado
    setTimeout(() => {
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Se desactivará este rol para el usuario',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        // Ajustar z-index para que aparezca sobre otros modales
        customClass: {
          container: 'swal-container-higher-z-index'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceder con la desactivación
          const payload = {
            asignacion_id: asignacionId,
            motivo_cambio: 'Desactivación manual'
          };

          this.cargando = true;
          this.servicesService.post('/roles/desactivar', payload)
            .pipe(takeUntil(this.destruir$))
            .subscribe({
              next: (res: any) => {
                // Mostrar mensaje fuera del modal
                this.mensajeAPIPrincipal = res.message || 'Rol desactivado correctamente';
                this.tipoMensajeAPIPrincipal = 'success';
                this.mostrarMensajeAPIPrincipal = true;

                // Auto-ocultar después de unos segundos
                setTimeout(() => {
                  this.mostrarMensajeAPIPrincipal = false;
                }, 5000);

                // Recargar la lista de usuarios para actualizar la UI
                // this.cargarListaUsuarios();
                this.cargando = false;
              },
              error: (err) => {
                console.error('Error al desactivar rol:', err);
                this.mostrarError(err.error?.message || 'Error al desactivar rol');
                this.cargando = false;

                // Volver a abrir el modal principal si hay error
                this.abrirModalAsignarRol(this.usuarioSeleccionado);
              }
            });
        } else {
          // Si el usuario cancela, volvemos a abrir el modal principal
          this.abrirModalAsignarRol(this.usuarioSeleccionado);
        }
      });
    }, 300); // Pequeño retraso para asegurar una transición suave
  }

  // Método para seleccionar/deseleccionar todos en la tabla principal
  seleccionarTodos(event: any): void {
    const isChecked = event.target.checked;

    // Aplicar la selección solo a los usuarios filtrados y visibles en la página actual
    this.usuariosModalPaginados.forEach(usuario => {
      if (usuario.aut_us_estado === 1) {
        usuario.seleccionado = isChecked;

        // Actualizar también el usuario correspondiente en usuariosFiltradosModal
        const usuarioEnFiltrados = this.usuariosFiltradosModal.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
        if (usuarioEnFiltrados) {
          usuarioEnFiltrados.seleccionado = isChecked;
        }

        // Actualizar también el usuario correspondiente en listaUsuarios
        const usuarioEnLista = this.listaUsuarios.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
        if (usuarioEnLista) {
          usuarioEnLista.seleccionado = isChecked;
        }
      }
    });

    // Actualizar la lista de seleccionados completa
    this.actualizarListaUsuariosSeleccionados();
  }

  // Método para seleccionar/deseleccionar todos los usuarios filtrados
  seleccionarTodosUsuariosFiltrados(event: any): void {
    const seleccionar = event.target.checked;
    this.seleccionarTodosActivo = seleccionar;

    // Actualizar selección de usuarios filtrados
    this.usuariosFiltrados.forEach(usuario => {
      // Solo seleccionar usuarios activos
      if (usuario.aut_us_estado === 1) {
        usuario.seleccionado = seleccionar;

        // Actualizar también en listaUsuarios
        const usuarioEnLista = this.listaUsuarios.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
        if (usuarioEnLista) {
          usuarioEnLista.seleccionado = seleccionar;
        }

        // Actualizar también en usuariosFiltradosModal
        const usuarioEnFiltrados = this.usuariosFiltradosModal.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
        if (usuarioEnFiltrados) {
          usuarioEnFiltrados.seleccionado = seleccionar;
        }
      }
    });

    // Actualizar la lista de seleccionados
    this.actualizarListaUsuariosSeleccionados();
  }

  // Método para alternar la selección de un usuario
  toggleSeleccionUsuario(usuario: any): void {
    usuario.seleccionado = !usuario.seleccionado;

    // Actualizar también en listaUsuarios
    const usuarioEnLista = this.listaUsuarios.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
    if (usuarioEnLista) {
      usuarioEnLista.seleccionado = usuario.seleccionado;
    }

    // Actualizar también en usuariosFiltrados
    const usuarioEnFiltrados = this.usuariosFiltrados.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
    if (usuarioEnFiltrados) {
      usuarioEnFiltrados.seleccionado = usuario.seleccionado;
    }

    // Actualizar también en usuariosFiltradosModal
    const usuarioEnFiltradosModal = this.usuariosFiltradosModal.find(u => u.aut_id_usuario === usuario.aut_id_usuario);
    if (usuarioEnFiltradosModal) {
      usuarioEnFiltradosModal.seleccionado = usuario.seleccionado;
    }

    // Actualizar la lista de seleccionados
    this.actualizarListaUsuariosSeleccionados();

    // Actualizar estado del "seleccionar todos" si es necesario
    this.actualizarEstadoSeleccionarTodos();
  }

  // Método para actualizar el estado del checkbox "seleccionar todos"
  actualizarEstadoSeleccionarTodos(): void {
    // Si hay usuarios filtrados activos y todos están seleccionados
    const usuariosFiltradosActivos = this.usuariosFiltrados.filter(u => u.aut_us_estado === 1);
    if (usuariosFiltradosActivos.length > 0) {
      this.seleccionarTodosActivo = usuariosFiltradosActivos.every(u => u.seleccionado);
    } else {
      this.seleccionarTodosActivo = false;
    }
  }

  actualizarListaUsuariosSeleccionados(): void {
    // Crear una lista nueva basada en todos los usuarios que tienen seleccionado = true
    this.usuariosSeleccionados = this.listaUsuarios.filter(usuario => usuario.seleccionado);

    // Actualizar el estado del checkbox "seleccionar todos"
    this.actualizarEstadoSeleccionarTodos();
  }

  limpiarSeleccion(): void {
    // Desmarcar todos los usuarios en todas las listas
    this.listaUsuarios.forEach(usuario => {
      usuario.seleccionado = false;
    });

    this.usuariosFiltrados.forEach(usuario => {
      usuario.seleccionado = false;
    });

    this.usuariosFiltradosModal.forEach(usuario => {
      usuario.seleccionado = false;
    });

    this.usuariosModalPaginados.forEach(usuario => {
      usuario.seleccionado = false;
    });

    // Vaciar la lista de seleccionados
    this.usuariosSeleccionados = [];

    // Resetear el estado "seleccionar todos"
    this.seleccionarTodosActivo = false;
  }

  // Método separado para mostrar la confirmación
  mostrarConfirmacionAsignacion(rolId: number, rolNombre: string, turno: string): void {
    // Cerrar el modal primero para evitar problemas de z-index
    this.modalAsignacionMasiva.hide();

    // Pequeño retraso para asegurar que el modal se ha cerrado
    setTimeout(() => {
      Swal.fire({
        title: 'Confirmar asignación',
        html: `
        <p>¿Está seguro de asignar el rol <strong>${rolNombre}</strong>
        con turno <strong>${turno}</strong> a
        <strong>${this.usuariosSeleccionados.length}</strong> usuario(s)?</p>
      `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: {
          container: 'swal-container-higher-z-index',
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceder con la asignación
          this.procesarAsignacionMasiva(rolId, turno);
        } else {
          // Si cancela, volver a abrir el modal de asignación masiva
          this.modalAsignacionMasiva.show();
        }
      });
    }, 300);
  }

  // Método para obtener el nombre del rol por ID
  obtenerNombreRol(rolId: number): string {
    const rol = this.rolesDisponibles.find(r => r.id_rol === rolId);
    return rol ? rol.rol : 'Desconocido';
  }

  // Método procesarAsignacionMasiva revisado y completo
  procesarAsignacionMasiva(rolId: number, turno: string): void {
    // Verificar que haya usuarios seleccionados
    if (this.usuariosSeleccionados.length === 0) {
      this.mostrarError("Por favor, seleccione al menos un usuario para asignar el rol");
      return;
    }

    // Obtener información del rol para mostrarla en los mensajes
    const rolNombre = this.obtenerNombreRol(rolId);

    // Mostrar indicador de progreso
    Swal.fire({
      title: 'Procesando asignación',
      html: `Asignando rol <strong>${rolNombre}</strong> a ${this.usuariosSeleccionados.length} usuario(s)...`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.cargando = true;

    // Guardar una copia de los usuarios seleccionados para referencia posterior
    const usuariosSeleccionadosCopia = [...this.usuariosSeleccionados];
    const totalUsuariosSeleccionados = usuariosSeleccionadosCopia.length;

    // Array para almacenar todas las promesas de asignación
    const promesasAsignacion = usuariosSeleccionadosCopia.map(usuario => {
      const payload = {
        usuario_id: usuario.aut_id_usuario,
        roles: [{
          rol_id: rolId,
          turno: turno
        }]
      };

      return new Promise((resolve, reject) => {
        this.servicesService.post('/roles/asignar', payload).subscribe({
          next: (res) => resolve({ usuario, resultado: res }),
          error: (err) => reject({ usuario, error: err })
        });
      });
    });

    // Ejecutar todas las asignaciones y manejar resultados
    Promise.allSettled(promesasAsignacion)
      .then(resultados => {
        // Contar resultados exitosos y fallidos
        const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
        const fallidos = resultados.filter(r => r.status === 'rejected').length;

        // Cerrar el indicador de progreso
        Swal.close();

        if (exitosos > 0) {
          // Cerrar el modal
          if (this.modalAsignacionMasiva) {
            this.modalAsignacionMasiva.hide();
          }

          // Recargar datos con resaltado para mostrar los cambios
          this.recargarTablaConResaltado(usuariosSeleccionadosCopia);
          this.limpiarSeleccion();

          // Después de que los datos se han recargado, mostrar las notificaciones
          setTimeout(() => {
            // 1. Mostrar notificación principal con SweetAlert2
            Swal.fire({
              title: '¡Asignación completada!',
              html: `
              <div class="text-center">
                <i class="fa-solid fa-check-circle text-success" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Se asignó el rol <strong>${rolNombre}</strong> con turno <strong>${turno}</strong>:</p>
                <p><strong>${exitosos}</strong> de <strong>${totalUsuariosSeleccionados}</strong> usuario(s) con éxito.</p>
                ${fallidos > 0 ? `<p class="text-warning"><i class="fa-solid fa-exclamation-triangle"></i> ${fallidos} asignaciones no pudieron completarse.</p>` : ''}
              </div>
            `,
              icon: 'success',
              confirmButtonText: 'Entendido',
              timer: 5000, // Se cerrará automáticamente después de 5 segundos
              timerProgressBar: true,
              customClass: {
                popup: 'swal-wide',
                title: 'swal-title-large',
                confirmButton: 'btn btn-success'
              }
            });

            // 2. Mostrar notificación flotante más persistente
            this.mostrarNotificacionFlotante(
              `<strong>¡Éxito!</strong> Se asignó el rol "${rolNombre}" con turno ${turno} a ${exitosos} de ${totalUsuariosSeleccionados} usuario(s).`,
              'success',
              8000 // Se mostrará por 8 segundos
            );

            // 3. También actualizar el mensaje en la UI principal para referencia
            this.mensajeAPIPrincipal = `Se asignó el rol "${rolNombre}" con turno ${turno} a ${exitosos} de ${totalUsuariosSeleccionados} usuario(s).`;
            this.tipoMensajeAPIPrincipal = 'success';
            this.mostrarMensajeAPIPrincipal = true;

            // Auto-ocultar el mensaje persistente después de un tiempo más largo
            setTimeout(() => {
              this.mostrarMensajeAPIPrincipal = false;
            }, 10000); // 10 segundos
          }, 1000); // Esperar 1 segundo después de que la tabla se ha recargado
        } else {
          // Mostrar mensaje de error
          Swal.fire({
            title: 'Error en la asignación',
            html: `
            <div class="text-center">
              <i class="fa-solid fa-times-circle text-danger" style="font-size: 3rem; margin-bottom: 1rem;"></i>
              <p>No se pudo asignar el rol <strong>${rolNombre}</strong>.</p>
              <p>Por favor, intente nuevamente o contacte a soporte técnico.</p>
            </div>
          `,
            icon: 'error',
            confirmButtonText: 'Entendido',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });

          // Mostrar notificación de error flotante
          this.mostrarNotificacionFlotante(
            `<strong>Error:</strong> No se pudo completar la asignación de roles.`,
            'danger',
            8000
          );
        }

        this.cargando = false;
      })
      .catch(err => {
        // Cerrar el indicador de progreso
        Swal.close();

        console.error('Error en asignación masiva:', err);

        // Mostrar error con SweetAlert2
        Swal.fire({
          title: 'Error inesperado',
          html: `
          <div class="text-center">
            <i class="fa-solid fa-exclamation-circle text-danger" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <p>Ocurrió un error durante el proceso de asignación.</p>
            <p class="text-muted small">Detalles técnicos: ${err.message || 'Error no especificado'}</p>
          </div>
        `,
          icon: 'error',
          confirmButtonText: 'Entendido',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });

        // Mostrar notificación flotante de error
        this.mostrarNotificacionFlotante(
          `<strong>Error crítico:</strong> Falló el proceso de asignación de roles.`,
          'danger',
          8000
        );

        this.cargando = false;
      });
  }

  // Método para recargar la tabla y resaltar las filas modificadas
  recargarTablaConResaltado(usuariosModificados: any[]): void {
    this.cargando = true;

    // Guardar los IDs de usuarios modificados para resaltarlos después
    const idsModificados = usuariosModificados.map(u => u.aut_id_usuario);

    // Obtener los datos actualizados del servidor
    this.servicesService.get(`/roles/usuarios/Codificación - Cod`)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          // Actualizar lista de usuarios
          this.listaUsuarios = (res.roles || []).map(usuario => ({
            ...usuario,
            seleccionado: false,
            // Marcar los usuarios que fueron modificados para resaltarlos
            recienModificado: idsModificados.includes(usuario.aut_id_usuario)
          }));

          // Actualizar listas filtradas
          this.usuariosTotal = [...this.listaUsuarios];
          this.usuariosFiltradosModal = [...this.listaUsuarios];

          // Intentar destruir la tabla existente
          try {
            const tabla = $('#tablaPrincipal').DataTable();
            if (tabla) {
              tabla.destroy();
            }
          } catch (error) {
            console.warn('Error al destruir tabla:', error);
          }

          // Actualizar el DOM y volver a disparar el evento de inicialización
          setTimeout(() => {
            this.dtTrigger.next(null);

            // Ocultar elementos no deseados y aplicar resaltado a filas modificadas
            setTimeout(() => {
              $('.dataTables_length').hide();
              $('.dataTables_info').hide();
              $('.dataTables_filter label').contents().filter(function() {
                return this.nodeType === 3;
              }).remove();

              // Resaltar las filas de usuarios recientemente modificados
              this.listaUsuarios.forEach((usuario, index) => {
                if (usuario.recienModificado) {
                  const fila = $(`#tablaPrincipal tbody tr`).eq(index);

                  // Aplicar un resaltado temporal con animación
                  fila.addClass('bg-success-light');

                  // Después de 5 segundos, eliminar el resaltado con una transición suave
                  setTimeout(() => {
                    fila.css('transition', 'background-color 1.5s ease');
                    fila.removeClass('bg-success-light');
                  }, 5000);
                }
              });

              this.cargando = false;
            }, 300);
          }, 100);
        },
        error: (err) => {
          console.error('Error al recargar usuarios:', err);
          this.mostrarError('No se pudieron recargar los datos de la tabla.');
          this.cargando = false;
        }
      });
  }

  // Método para mostrar notificaciones tipo toast personalizadas
  mostrarNotificacionFlotante(mensaje: string, tipo: 'success' | 'danger', duracion: number = 5000): void {
    // Asegurarse de que no haya otra notificación activa primero
    const contenedorExistente = document.querySelector('.alerta-flotante-container');
    if (contenedorExistente) {
      document.body.removeChild(contenedorExistente);
    }

    // Crear el contenedor principal
    const contenedor = document.createElement('div');
    contenedor.className = 'alerta-flotante-container';

    // Crear la alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta-flotante alert alert-dismissible d-flex align-items-center ${tipo}`;
    alerta.role = 'alert';

    // Icono según el tipo
    const icono = document.createElement('i');
    icono.className = `icono fa-solid ${tipo === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`;

    // Contenido
    const contenido = document.createElement('div');
    contenido.innerHTML = mensaje;

    // Botón de cerrar
    const botonCerrar = document.createElement('button');
    botonCerrar.type = 'button';
    botonCerrar.className = 'btn-close';
    botonCerrar.setAttribute('data-bs-dismiss', 'alert');
    botonCerrar.setAttribute('aria-label', 'Close');
    botonCerrar.onclick = () => {
      document.body.removeChild(contenedor);
    };

    // Ensamblar
    alerta.appendChild(icono);
    alerta.appendChild(contenido);
    alerta.appendChild(botonCerrar);
    contenedor.appendChild(alerta);

    // Añadir al body
    document.body.appendChild(contenedor);

    // Auto-eliminar después del tiempo especificado
    setTimeout(() => {
      if (document.body.contains(contenedor)) {
        // Agregar clase para animar la salida
        alerta.style.transition = 'all 0.5s ease';
        alerta.style.transform = 'translateX(100%)';
        alerta.style.opacity = '0';

        // Eliminar después de la animación
        setTimeout(() => {
          if (document.body.contains(contenedor)) {
            document.body.removeChild(contenedor);
          }
        }, 500);
      }
    }, duracion);
  }

  // Métodos para filtros en la tabla principal
  inicializarFiltros(): void {
    // Obtener roles únicos para el filtro
    const rolesUnicos = [...new Set(this.listaUsuarios.map(usuario => usuario.rol))];
    this.filtrosDisponibles = {
      roles: rolesUnicos
    };
  }

  aplicarFiltrosV1(): void {
    const textoFiltro = this.textoFiltro?.toLowerCase() || '';
    const rolFiltro = this.rolFiltro || '';
    const estadoFiltro = this.estadoFiltro || '';

    // Aplicar filtros a la lista completa
    this.usuariosFiltrados = this.listaUsuarios.filter(usuario => {
      // Filtro por texto
      const coincideTexto = !textoFiltro ||
        usuario.aut_us_usuario?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_nombres?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_paterno?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_materno?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_ci?.includes(textoFiltro);

      // Filtro por rol
      const coincideRol = !rolFiltro || usuario.rol === rolFiltro;

      // Filtro por estado
      const coincideEstado = !estadoFiltro ||
        (estadoFiltro === 'activo' && usuario.aut_us_estado === 1) ||
        (estadoFiltro === 'inactivo' && usuario.aut_us_estado !== 1);

      return coincideTexto && coincideRol && coincideEstado;
    });

    // Actualizar DataTable si está inicializada
    setTimeout(() => {
      const tabla = $('#tablaPrincipal').DataTable();
      if (tabla) {
        tabla.draw();
      }
    }, 100);
  }

  // VEAMOS
  aplicarFiltrosV2(): void {
    if (!this.dtInstance) {
      console.warn('DataTable no está inicializada aún');
      setTimeout(() => this.aplicarFiltros(), 100);
      return;
    }

    // Limpiamos cualquier filtro previo
    this.dtInstance.search('').columns().search('').draw();

    // 1. Primero, aplicamos el filtrado a nivel de JavaScript
    const textoFiltro = this.textoFiltro?.toLowerCase() || '';
    const rolFiltro = this.rolFiltro || '';
    const estadoFiltro = this.estadoFiltro || '';

    // 2. Crear el filtro personalizado para DataTables
    $.fn.dataTable.ext.search.pop(); // Eliminar filtros anteriores

    if (textoFiltro || rolFiltro || estadoFiltro) {
      $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
        const row = this.listaUsuarios[dataIndex];
        if (!row) return false;

        // Filtro por texto
        const coincideTexto = !textoFiltro ||
          row.aut_us_usuario?.toLowerCase().includes(textoFiltro) ||
          row.aut_us_nombres?.toLowerCase().includes(textoFiltro) ||
          row.aut_us_paterno?.toLowerCase().includes(textoFiltro) ||
          row.aut_us_materno?.toLowerCase().includes(textoFiltro) ||
          row.aut_us_ci?.includes(textoFiltro);

        // Filtro por rol
        const coincideRol = !rolFiltro || row.rol === rolFiltro;

        // Filtro por estado
        const coincideEstado = !estadoFiltro ||
          (estadoFiltro === 'activo' && row.aut_us_estado === 1) ||
          (estadoFiltro === 'inactivo' && row.aut_us_estado !== 1);

        return coincideTexto && coincideRol && coincideEstado;
      });
    }

    // 3. Aplicar filtro y redibujar tabla
    this.dtInstance.draw();

    // 4. Actualizar lista de usuarios filtrados para otras funciones
    this.actualizarUsuariosFiltrados();
  }

  aplicarFiltros(): void {
    const textoFiltro = this.textoFiltro?.toLowerCase() || '';
    const rolFiltro = this.rolFiltro || '';
    const estadoFiltro = this.estadoFiltro || '';

    // Filtrar la lista original
    this.listaUsuariosFiltrada = this.listaUsuarios.filter(usuario => {
      // Filtro por texto
      const coincideTexto = !textoFiltro ||
        usuario.aut_us_usuario?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_nombres?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_paterno?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_materno?.toLowerCase().includes(textoFiltro) ||
        usuario.aut_us_ci?.toLowerCase().includes(textoFiltro);

      // Filtro por rol
      const coincideRol = !rolFiltro || usuario.rol === rolFiltro;

      // Filtro por estado
      const coincideEstado = !estadoFiltro ||
        (estadoFiltro === 'activo' && usuario.aut_us_estado === 1) ||
        (estadoFiltro === 'inactivo' && usuario.aut_us_estado !== 1);

      return coincideTexto && coincideRol && coincideEstado;
    });

    // También actulizar la lista usuariosFiltrados para mantener compatibilidad
    this.usuariosFiltrados = [...this.listaUsuariosFiltrada];
  }

  // Método nuevo para mantener sincronizada la lista de usuarios filtrados
  actualizarUsuariosFiltrados(): void {
    if (!this.dtInstance) return;

    // Obtener índices de filas visibles después del filtrado
    const indices = this.dtInstance.rows({ search: 'applied' }).indexes();

    // Crear array con usuarios filtrados basados en los índices
    this.usuariosFiltrados = indices.map(idx => this.listaUsuarios[idx]).toArray();
  }

  // END
  limpiarFiltros(): void {
    this.textoFiltro = '';
    this.rolFiltro = '';
    this.estadoFiltro = '';

    // Resetear lista filtrada a todos los usuarios
    this.listaUsuariosFiltrada = [...this.listaUsuarios];
    this.usuariosFiltrados = [...this.listaUsuarios];
  }

  // Verificar si hay filtros activos
  get hayFiltrosActivos(): boolean {
    return !!this.textoFiltro || !!this.rolFiltro || !!this.estadoFiltro;
  }

  // Texto para mostrar filtros activos
  get textoFiltrosActivos(): string {
    const filtros = [];

    if (this.textoFiltro) {
      filtros.push(`Texto: "${this.textoFiltro}"`);
    }

    if (this.rolFiltro) {
      filtros.push(`Rol: ${this.rolFiltro}`);
    }

    if (this.estadoFiltro) {
      filtros.push(`Estado: ${this.estadoFiltro === 'activo' ? 'Activos' : 'Inactivos'}`);
    }

    return filtros.join(' | ');
  }

  // Métodos para filtros en el modal
  filtrarUsuariosModal(): void {
    // Primero filtramos los usuarios
    const usuariosFiltrados = this.listaUsuarios.filter(usuario => {
      // Filtro por texto
      const coincideTexto = !this.textoFiltroModal ||
        usuario.aut_us_usuario.toLowerCase().includes(this.textoFiltroModal.toLowerCase()) ||
        usuario.aut_us_nombres.toLowerCase().includes(this.textoFiltroModal.toLowerCase()) ||
        usuario.aut_us_paterno.toLowerCase().includes(this.textoFiltroModal.toLowerCase()) ||
        usuario.aut_us_materno.toLowerCase().includes(this.textoFiltroModal.toLowerCase()) ||
        usuario.aut_us_ci.includes(this.textoFiltroModal);

      // Filtro por rol
      const coincideRol = !this.rolFiltroModal || usuario.rol === this.rolFiltroModal;

      // Filtro por estado
      const coincideEstado = !this.estadoFiltroModal ||
        (this.estadoFiltroModal === 'activo' && usuario.aut_us_estado === 1) ||
        (this.estadoFiltroModal === 'inactivo' && usuario.aut_us_estado !== 1);

      return coincideTexto && coincideRol && coincideEstado;
    });

    // Actualizamos listas y datos
    this.usuariosFiltradosModal = usuariosFiltrados;

    // También actualizamos la lista de usuarios filtrados para el componente de selección
    this.usuariosFiltrados = [...usuariosFiltrados];

    // Reseteamos la paginación
    this.paginaActualModal = 1;
    this.actualizarUsuariosModalPaginados();

    // Actualizar el estado de selección
    this.actualizarEstadoSeleccionarTodos();
  }

  limpiarFiltrosModal(): void {
    this.textoFiltroModal = '';
    this.rolFiltroModal = '';
    this.estadoFiltroModal = '';
    this.filtrarUsuariosModal();
  }

  // Métodos para paginación en el modal
  cambiarPaginaModal(pagina: number): void {
    this.paginaActualModal = pagina;
    this.actualizarUsuariosModalPaginados();
  }

  actualizarUsuariosModalPaginados(): void {
    const indiceInicio = (this.paginaActualModal - 1) * this.tamanioPaginaModal;
    const indiceFin = indiceInicio + this.tamanioPaginaModal;

    // Usar usuarios filtrados en lugar de todos los usuarios
    this.usuariosModalPaginados = this.usuariosFiltradosModal.slice(indiceInicio, indiceFin);
  }

  get totalPaginasModal(): number {
    return Math.ceil(this.usuariosFiltradosModal.length / this.tamanioPaginaModal);
  }

  get numerosPaginaModal(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginasModal; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Métodos para notificaciones
  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    console.log('Mostrando mensaje de éxito:', mensaje);

    // Verificar si el toast está inicializado
    if (!this.toastExito) {
      console.warn('Toast de éxito no inicializado, recreando...');
      const toastEl = document.getElementById('toastExito');
      if (toastEl) {
        this.toastExito = new bootstrap.Toast(toastEl, {
          animation: true,
          autohide: true,
          delay: 5000
        });
      }
    }

    // Intentar mostrar el toast
    if (this.toastExito) {
      this.toastExito.show();
    } else {
      // Fallback: Mostrar mensaje global
      this.mensajeAPIPrincipal = mensaje;
      this.tipoMensajeAPIPrincipal = 'success';
      this.mostrarMensajeAPIPrincipal = true;

      // Auto-ocultar después de unos segundos
      setTimeout(() => {
        this.mostrarMensajeAPIPrincipal = false;
      }, 5000);
    }
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    console.log('Mostrando mensaje de error:', mensaje);

    // Verificar si el toast está inicializado
    if (!this.toastError) {
      console.warn('Toast de error no inicializado, recreando...');
      const toastEl = document.getElementById('toastError');
      if (toastEl) {
        this.toastError = new bootstrap.Toast(toastEl, {
          animation: true,
          autohide: true,
          delay: 5000
        });
      }
    }

    // Intentar mostrar el toast
    if (this.toastError) {
      this.toastError.show();
    } else {
      // Fallback: Mostrar mensaje global
      this.mensajeAPIPrincipal = mensaje;
      this.tipoMensajeAPIPrincipal = 'danger';
      this.mostrarMensajeAPIPrincipal = true;

      // Auto-ocultar después de unos segundos
      setTimeout(() => {
        this.mostrarMensajeAPIPrincipal = false;
      }, 5000);
    }
  }

  // Método para manejar la visibilidad del panel de filtros
  togglePanelFiltros(): void {
    const panel = document.getElementById('panelFiltros');
    if (panel) {
      if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    }
  }

  // Método para reinicializar la UI completamente
  reinicializarUI(): void {
    // Resetear todos los estados
    this.cargando = true;

    // Cerrar cualquier modal abierto
    if (this.modalAsignarRol) {
      this.modalAsignarRol.hide();
    }
    if (this.modalAsignacionMasiva) {
      this.modalAsignacionMasiva.hide();
    }

    // Limpiar selecciones y formularios
    this.usuarioSeleccionado = null;
    this.usuariosSeleccionados = [];
    this.formularioRol.reset();
    this.formularioRolMasivo.reset();

    // Recargar datos
    this.cargarListaUsuarios();

    // Asegurarse de restablecer el estado de carga
    setTimeout(() => {
      this.cargando = false;
    }, 1000);
  }

  // Método para cerrar modal y resetear
  cerrarModalAsignacionMasiva(): void {
    if (this.modalAsignacionMasiva) {
      this.modalAsignacionMasiva.hide();
    }

    // Resetear formulario y selecciones
    this.formularioRolMasivo.reset();
    this.limpiarSeleccion();
  }

  inicializarOpcionesDatatable(): void {
    this.dtOptions = {
      paging: true,
      searching: true,
      language: {
        ...LanguageApp.spanish_datatables,
        info: ""
      },
      dom: '<"row mb-3"<"col-md-6"B><"col-md-6 d-flex justify-content-end"f>>rt<"row"<"col-md-6"i><"col-md-6"p>>',
      lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
      pageLength: 10,
      buttons: [
        // Los botones se mantienen igual...
      ],
      responsive: true,
      autoWidth: false,
      pagingType: 'full_numbers',
      drawCallback: function () {
        $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        $('.dataTables_info').css('display', 'none');
      },
      initComplete: (settings, json) => {
        this.dtInstance = $(settings.nTable).DataTable();
        $('.dataTables_filter').hide();
        $('.dataTables_info').css('display', 'none');

        // Marcar la tabla como inicializada
        this.tablaInicializando = false;

        // Si hay filtros pendientes, aplicarlos ahora
        if (this.filtrosPendientes) {
          this.filtrosPendientes = false;
          setTimeout(() => this.aplicarFiltros(), 0);
        }
      }
    };
  }

  // Método para iniciar la asignación masiva
  asignarRolesMultiplesUsuarios(): void {
    if (this.formularioRolMasivo.invalid || this.usuariosSeleccionados.length === 0) {
      // Mostrar mensaje de error
      this.mostrarError("Por favor, seleccione un rol y al menos un usuario");
      return;
    }

    const datosFormulario = this.formularioRolMasivo.value;
    const rolId = parseInt(datosFormulario.rol_id);
    const rolNombre = this.obtenerNombreRol(rolId);
    const turno = datosFormulario.turno;

    // Cerrar el modal primero para evitar problemas de z-index
    this.modalAsignacionMasiva.hide();

    // Pequeño retraso para asegurar que el modal se haya cerrado completamente
    setTimeout(() => {
      // Mostrar confirmación usando SweetAlert2 con z-index más alto
      Swal.fire({
        title: 'Confirmar asignación masiva',
        html: `
        <p>¿Está seguro de asignar el rol <strong>${rolNombre}</strong>
        con turno <strong>${turno}</strong> a
        <strong>${this.usuariosSeleccionados.length}</strong> usuario(s)?</p>
      `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: {
          container: 'swal-container-higher-z-index',
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceder con la asignación
          this.procesarAsignacionMasiva(rolId, turno);
        } else {
          // Si cancela, volver a abrir el modal de asignación masiva
          this.modalAsignacionMasiva.show();
        }
      });
    }, 300); // Retraso para asegurar la transición
  }

  verHistorialRolesUsuario(usuarioId: number): void {
    // Cargar el historial de roles del usuario
    this.cargarHistorialRolesUsuario(usuarioId);
    // Mostrar el modal de historial
    this.modalHistorialRoles.show();
  }

  // Método para cargar los datos del historial
  cargarHistorialRolesUsuario(usuarioId: number): void {
    this.cargando = true;
    this.usuarioHistorialId = usuarioId;

    // Buscar el usuario en la lista para mostrar sus datos
    this.usuarioHistorial = this.listaUsuarios.find(u => u.aut_id_usuario === usuarioId);

    // Llamada a la API con el endpoint existente
    this.servicesService.get(`/roles/historial/${usuarioId}`)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (res: any) => {
          // Combinar asignaciones actuales y el historial
          const asignacionesActuales = res.asignacionesActuales || [];
          const historialAsignaciones = res.historialAsignaciones || [];

          // Procesamos todas las asignaciones para agregar una propiedad 'activo'
          const todas = [...asignacionesActuales, ...historialAsignaciones].map(asignacion => ({
            ...asignacion,
            activo: asignacion.fecha_finalizacion === null
          }));

          // Eliminamos posibles duplicados (basándonos en el ID)
          const idsUnicos = new Set();
          this.historialRolesUsuario = todas.filter(asig => {
            if (idsUnicos.has(asig.id)) {
              return false;
            }
            idsUnicos.add(asig.id);
            return true;
          });

          // Ordenamos por fecha de asignación (más reciente primero)
          this.historialRolesUsuario.sort((a, b) =>
            new Date(b.fecha_asignacion).getTime() - new Date(a.fecha_asignacion).getTime()
          );

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar historial de roles:', err);
          this.mostrarError('No se pudo cargar el historial de roles del usuario');
          this.cargando = false;
        }
      });
  }

  // Getter para filtrar el historial según las opciones seleccionadas
  get historialRolesFiltrado(): any[] {
    if (!this.filtroHistorial.mostrarActivos && !this.filtroHistorial.mostrarInactivos) {
      // Si no hay filtros activos, mostrar todo
      return this.historialRolesUsuario;
    }

    return this.historialRolesUsuario.filter(historial => {
      if (this.filtroHistorial.mostrarActivos && historial.activo) {
        return true;
      }
      if (this.filtroHistorial.mostrarInactivos && !historial.activo) {
        return true;
      }
      return false;
    });
  }

}
