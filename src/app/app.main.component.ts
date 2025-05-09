import {
  Component,
  OnDestroy,
  Renderer2,
  OnInit,
  NgZone,
  ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServicesService } from './Services/services.sevice';
import { SocketService } from './Services/socket.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './app.main.component.html',
  styleUrls: ['./app.main.component.css'],
})
export class AppMainComponent implements OnInit, OnDestroy {
  realizoCarga: boolean;

  visibilidadMenus: boolean;
  menu = [];
  grupoUsuario: string;
  nombreUsuario: string;
  inicialUsuario: string;
  id_usuario: any;
  colorUsuario: string;
  style: any;

  isMobileLayout = false;

  visibleMenuOpciones: boolean;
  rol_inicial: any;
  observaciones: any;
  tam: any;
  visibleModal: boolean = false;
  titulo: any;
  notificacion: any;
  notificaciones: any[] = [];
  notifications: any[] = [];
  noti_id: any;
  private notificationSub!: Subscription;

  constructor(
    public renderer: Renderer2,
    public zone: NgZone,
    private serviceService: ServicesService,
    private router: Router,
    private socketService: SocketService
  ) {}

  public get isMobileAgent() {
    const agent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    // tslint:disable-next-line:max-line-length
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        agent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        agent.substr(0, 4)
      )
    );
  }

  ngOnInit() {
    this.visibilidadMenus = false;
    this.realizoCarga = false;
    this.colorUsuario = ' 0xF345FF';

    window.onresize = () => (this.isMobileLayout = window.innerWidth <= 991);

    this.visibleMenuOpciones = false;
    // console.log(localStorage.getItem('grupo'), 'grupo');

    this.grupoUsuario = localStorage.getItem('grupo');
    this.nombreUsuario = localStorage.getItem('nombre');
    this.inicialUsuario = localStorage.getItem('inicial');
    this.id_usuario = localStorage.getItem('id_usuario');
    this.rol_inicial = localStorage.getItem('id_rol');
    this.cargarMenus();
    // Escuchar notificaciones en tiempo real

    // console.log(localStorage.length == 0, '<==== id_usuario verificar');
    setInterval(() => {
      if (localStorage.length != 0) {
        // console.log(localStorage.length != 0);
        this.listadoNotificaciones();
        this.notificationSub = this.socketService
          .onNotification()
          .subscribe((notification) => {
            // console.log('Notificación recibida:', notification);
            this.notifications.push(notification);
          });

        // Cargar notificaciones iniciales desde REST

        this.serviceService.get(`/dashboard/notificacion`).subscribe((data) => {
          // console.log(data, '<===data app.main.compopnents');
          this.observaciones = this.notificaciones.concat(data);
        });
      }
    }, 10000);

    // },1000)
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    this.socketService.disconnect();
  }
  ngAfterViewInit() {}

  cargarMenus() {
    const lista = JSON.parse(localStorage.getItem('menu'));
    lista.forEach((item: any) => {
      let listaSubMenus = [];
      let temporales;
      let filaTemporal;
      if (item.hijos) {
        temporales = item.hijos.split('*|*');
        temporales.forEach((element) => {
          filaTemporal = element.split(',');
          listaSubMenus.push({
            title: filaTemporal[0],
            path: filaTemporal[1],
          });
        });
      }
      this.menu.push({
        icon: item.icono,
        title: item.descripcion,
        path: item.ruta,
        submenu: listaSubMenus,
        seleccion: false,
        activo: false,
      });
    });
  }

  listadoNotificaciones() {
    // if (localStorage.getItem('id_rol') != '5') {
    this.serviceService.get(`/dashboard/notificacion`).subscribe((res: any) => {
      // console.log(res[0].descripcion_larga, '<==== DATOS TAMAÑO');

      this.observaciones = res;
      if (this.observaciones.length > 0) {
        // console.log(this.observaciones[0].descripcion_larga, 'descripcion');
        this.observaciones[0].descripcion_larga =
          this.observaciones[0].descripcion_larga.substring(0, 30) + '...';
        this.tam = res.length;
        console.log(this.tam);
      } else {
        this.tam = 0;
      }
    });
    // }
  }
  notificacionModal(id) {
    this.noti_id = id;
    this.visibleModal = true;
    this.serviceService
      .get(`/dashboard/notificacion_t/${this.noti_id}`)
      .subscribe((res: any) => {
        this.titulo = res.data[0].titulo_noti;
        this.notificacion = res.data[0].descripcion_larga;
      });
  }

  cerrarNotificacion() {
    this.visibleModal = false;
    this.serviceService
      .put(`/dashboard/marcarVisto/`, { ids: this.noti_id })
      .subscribe((res: any) => {
        this.listadoNotificaciones();
      });
  }
  mostrarMenuBarraLateral(valor) {
    // let myTag = this.elementRef.nativeElement.querySelector("html");
    let myTag = document.getElementById('menu-lateral');
    if (myTag.classList.contains('layout-menu-expanded')) {
      myTag.classList.remove('layout-menu-expanded');
    } else {
      myTag.classList.add('layout-menu-expanded');
    }
    // console.log(myTag.classList.add('layout-menu-expanded')) // you can select html element by getelementsByClassName also, please use as per your requirement.
  }

  mostrarOpciones(valor) {
    this.visibleMenuOpciones = valor;
  }

  mostrarMenuActivo(valor) {
    alert();
    this.visibleMenuOpciones = valor;
  }

  asignarMenuActivo(item, indice, event) {
    event.preventDefault();

    this.menu.forEach((element, index) => {
      if (indice !== index) {
        this.menu[index].seleccion = false;
        this.menu[index].activo = false;
      }
    });

    this.menu[indice].seleccion = !this.menu[indice].seleccion;
    this.menu[indice].activo = !this.menu[indice].activo;

    if (item.submenu.length == 0) {
      this.router.navigate([item.path]);
      this.mostrarMenuBarraLateral(false);
    }
  }

  menuSeleccionado(item, estado) {
    // alert('holas')
    /*  console.log('seleecion click');
        this.menu.forEach((element, index) => {
            this.menu[index].seleccion = false;
        });
        if (estado == true) {
            this.menu[indice].seleccion = true;
        }*/
  }

  subMenuSeleccionado(item) {
    this.router.navigate([item.path]);
    this.mostrarMenuBarraLateral(false);
  }

  modificarVisibilidadMenus() {
    this.visibilidadMenus = !this.visibilidadMenus;
  }
  cerrarSesion() {
    this.serviceService
      .get(`/login/logout/${localStorage.getItem('id_usuario')}`)
      .subscribe((res: any) => {
        localStorage.clear();
        // Swal.fire({
        //   title: res.title,
        //   icon: 'info',
        //   html: res.text,
        //   timer: 2500,
        //   showConfirmButton: false,
        // });
        this.router.navigate(['login']);
      });
  }
}
