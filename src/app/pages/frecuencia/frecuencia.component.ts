import { Component, OnInit } from '@angular/core';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-frecuencia',
  templateUrl: './frecuencia.component.html',
  styleUrls: ['./frecuencia.component.css'],
})
export class FrecuenciaComponent implements OnInit {
  dtOptions: any = {};
  deptoModel: any;
  mpioModel: any;
  agModel: any;
  aeModel: any;
  deptoOption: any;
  mpioResult: any;
  agResult: any;
  aeResult: any;
  mpioSel: any;
  disabledButton: boolean = true;
  query: string;
  form: { depto: any; mpio: any; ag: any; ae: any };
  resultado: any;
  tituloHeader: string;
  displayCatalogo: boolean = false;
  cat_cuest_model: any;
  desc_cat_model: any;
  catalogo_model: any;
  codigo_model: any;
  result_respuesta: any;
  form_cat: {
    cat_cuest: any;
    desc_model: any;
    catalogo: any;
    codigo: any;
    result: any;
  };

  constructor(private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      searching: true,
      language: LanguageApp.spanish_datatables,
      dom: 'Bfrtip', // Para incluir los botones
      buttons: [
        {
          extend: 'print',
          text: '<i class="fa-solid fa-print"></i> Imprimir',
          className: 'btn btn-warning',
        },

        {
          extend: 'excel',
          text: '<i class="fa-solid fa-file-excel"></i> Descargar Excel',
          title: 'Reporte de Catalogos',
          className: 'btn btn-info',
          exportOptions: {
            // Especificar las columnas que quieres exportar por índice
            columns: [0, 1, 2, 3, 4, 5, 6], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
          },
          customize: function (xlsx) {
            let sheet = xlsx.xl.worksheets['sheet1.xml'];
            // Modificar el fondo de los encabezados
            const headers = sheet
              .getElementsByTagName('row')[0]
              .getElementsByTagName('c');
            for (let i = 0; i < headers.length; i++) {
              const header = headers[i];
              // Agregar fondo color gris claro a los encabezados
              header.setAttribute('a', '30'); // 's' hace referencia al estilo en Excel (fondo de celda)
            }

            // Cambiar el tamaño de las fuentes y poner en negrita los encabezados
            const rows = sheet.getElementsByTagName('row');
            for (let row of rows) {
              const cells = row.getElementsByTagName('c');
              for (let cell of cells) {
                const style = cell.getAttribute('a');
                if (style && style === '30') {
                  // Si el estilo es de los encabezados, hacemos que el texto sea negrita
                  cell.setAttribute('t', 'inlineStr');
                  const istring = document.createElement('is');
                  const t = document.createElement('t');
                  t.textContent = cell.textContent; // el valor del título de la celda
                  istring.appendChild(t);
                  cell.textContent = '';
                  cell.appendChild(istring);
                  // Aplicamos estilo de texto negrita a los encabezados
                  cell.setAttribute('s', '2'); // '2' es el estilo en Excel para texto en negrita
                }
              }
            }
            // Comprobar si ya existe el filtro y agregarlo si no está presente
            const autofilter = sheet.getElementsByTagName('autoFilter');
            if (autofilter.length === 0) {
              const autoFilter = document.createElement('autoFilter');
              autoFilter.setAttribute('ref', 'A2:G2'); // Definir el rango de columnas para el filtro
              // Asegúrate de insertarlo en la estructura correcta del XML (dentro de <worksheet>).
              let worksheetNode = sheet.getElementsByTagName('worksheet')[0];

              // Insertamos el filtro en el lugar correcto
              if (worksheetNode) {
                worksheetNode.appendChild(autoFilter);
              }
            }
          },
        },
      ],
    };
    this.getDepto();
    this.resultado = [''];
  }
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
    this.servicesService
      .post(`/frecuencia/searchFrec`, this.form)
      .subscribe((res: any) => {
        this.resultado = res.data;
      });
  }
  modalCatalogo(respuesta) {
    this.tituloHeader = 'Agregar Catálogo';
    this.displayCatalogo = true;
    this.result_respuesta = respuesta;
  }
  saveCatalogo() {
    console.log(this.result_respuesta);
    this.displayCatalogo = false;
    Swal.fire({
      title: 'Almacenar',
      icon: 'info',
      text: 'Desea almacenar este nuevo catalogo?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.form_cat = {
          cat_cuest: this.cat_cuest_model ? this.cat_cuest_model : '',
          desc_model: this.desc_cat_model ? this.desc_cat_model : '',
          catalogo: this.catalogo_model ? this.catalogo_model : '',
          codigo: this.codigo_model ? this.codigo_model : '',
          result: this.result_respuesta ? this.result_respuesta : '',
        };

        this.servicesService
          .post(`/frecuencia/saveCat`, this.form_cat)
          .subscribe((res: any) => {
            this.searchFre();
            Swal.fire({
              title: res.title,
              icon: res.icon,
              text: res.text,
            });
          });
      }
    });
  }
}
