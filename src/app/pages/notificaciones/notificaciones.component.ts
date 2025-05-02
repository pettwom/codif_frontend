import {
  Component,
  OnInit,
  AfterViewInit,
  Directive,
  ElementRef,
} from '@angular/core';
import { ServicesService } from 'src/app/Services/services.sevice';
import * as $ from 'jquery';
import 'select2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
})

// @Directive({
//   selector: '[appSelect2]'
// })
export class NotificacionesComponent implements OnInit, AfterViewInit {
  // variables
  listUser: any;
  form: any;
  titleNoti: any;
  commnetsNoti: any;
  userId: any;
  switchNoti: any;
  fechaFin:any;
  disabledFF: boolean=true
  fechaActual: any;
  input_fecha: any;


  constructor(
    private servicesService: ServicesService,
    private element: ElementRef
  ) {}
  ngOnInit(): void {
    this.fechaActual = new Date();
    this.input_fecha = document.getElementById('fecha_fin')
    this.input_fecha.min = new Date().toISOString().split("T")[0];
    this.listasUsuarios();
  }
  listasUsuarios() {
    this.servicesService.get(`/dashboard/getUser`).subscribe((res: any) => {
      this.listUser = res.data;
    });
  }
  // $('#formtabs-country').select2();

  ngAfterViewInit(): void {
    if (typeof $.fn.select2 !== 'undefined') {
      ($('#select2') as any).select2({
        placeholder: 'Seleccione una opción',
        allowClear: true,
        theme: "classic"
      });
      $($('#select2').data('select2')).css({height: '45px'});
    } else {
      console.error('Select2 no está disponible.');
    }
  }
  almacenarNoti(){
    Swal.fire({
      title: '¿Está seguro de almacenar la notificación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if(result.isConfirmed) {
        this.form = {
          'title':this.titleNoti,
          'comment':this.commnetsNoti,
          'user':$("#select2").val(),
          'switch':this.switchNoti,
          'fechaFin':this.fechaFin?this.fechaFin : new Date(),
        }

        this.servicesService.post(`/dashboard/almacenarNoti`, this.form)
        .subscribe((res:any)=>{
          Swal.fire({
            title: res.title,
            icon: res.icon,
            text: res.text,
            timer: 2000,
          })
        })
      }
    })
  }
  verificarTiempo(){
    if(this.switchNoti == false){
      this.disabledFF = true;
      this.fechaFin = '';
    }else{
      this.disabledFF = false;
    }
  }
}
