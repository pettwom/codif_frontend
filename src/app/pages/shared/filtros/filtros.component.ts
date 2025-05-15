import { Component, OnInit,EventEmitter, Output, Input } from '@angular/core';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.css']
})
export class FiltrosComponent  implements OnInit{
  deptoOption: any;
  deptoModel: any;
  disabledButton: boolean;
  mpioResult: any;
  mpioSel: any;
  agResult: any;
  mpioModel: any;
  aeResult: any;
  agModel: any;
  aeModel: any;
  form: { depto: any; mpio: any; ag: any; ae: any; };
  resultado: any;

   @Output() filtrosAplicados = new EventEmitter<any>();
  ngOnInit(): void {
    this.getDepto();
  }
constructor(private servicesService: ServicesService) {}
getDepto() {
    this.servicesService.get(`/frecuencia/getDepto`).subscribe((res: any) => {
      this.deptoOption = res.data;
    });
  }
  getMpio() {
    this.servicesService
      .get(`/frecuencia/getMpio/${this.deptoModel}`)
      .subscribe((res: any) => {
        console.log(res.data);
        this.disabledButton = false;
        this.mpioResult = res.data;
      });
  }
  getAg() {
    this.mpioSel = document.getElementById('mpioSel');
    this.servicesService
      .get(`/frecuencia/getAg/${this.deptoModel}/${this.mpioSel.value}`)
      .subscribe((res: any) => {
        console.log(res.data);
        this.agResult = res.data;
      });
  }
  getAe() {
    this.servicesService
      .get(
        `/frecuencia/getAe/${this.deptoModel}/${this.mpioModel}/${this.agModel}`
      )
      .subscribe((res: any) => {
        console.log(res.data);
        this.aeResult = res.data;
      });
  }
    searchFre() {
    this.form = {
      depto: this.deptoModel,
      mpio: this.mpioModel ? this.mpioModel : '',
      ag: this.agModel ? this.agModel : '',
      ae: this.aeModel ? this.aeModel : '',
    };
    this.filtrosAplicados.emit(this.form);
    // this.servicesService
    //   .post(`/frecuencia/searchFrec`, this.form)
    //   .subscribe((res: any) => {
    //     this.resultado = res.data;
    //     this.filtrosAplicados.emit(this.resultado);
    //   });
  }
}
