import { Component, OnInit, ViewChild } from '@angular/core';
// import { DataTableDirective } from 'angular-datatables';
import { ServicesService } from 'src/app/Services/services.sevice';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { Subject } from 'rxjs';
import 'datatables.net';

@Component({
  selector: 'app-codautomatica',
  templateUrl: './codautomatica.component.html',
  styleUrls: ['./codautomatica.component.css'],
})

export class CodautomaticaComponent implements OnInit {
  dtOptions: any = {};
  // dtTrigger: Subject<any> = new Subject<any>();
  resultadosFiltrados: any[] = [];
  resultadoData: any;
  // dtOptions: any = {};

  ngOnInit(){
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
          title: 'Reporte de Respuestas Codificación Automática',
          className: 'btn btn-info',
          exportOptions: {
            // Especificar las columnas que quieres exportar por índice
            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
          },
          customize: function (xlsx) {
            const sheet = xlsx.xl.worksheets['sheet1.xml'];
            // Modificar el fondo de los encabezados
            const headers = sheet
              .getElementsByTagName('row')[0]
              .getElementsByTagName('c');
            for (let i = 0; i < headers.length; i++) {
              const header = headers[i];

              header.setAttribute('s', '17'); // 's' hace referencia al estilo en Excel (fondo de celda)
            }

            // Cambiar el tamaño de las fuentes y poner en negrita los encabezados
            const rows = sheet.getElementsByTagName('row');
            for (let row of rows) {
              const cells = row.getElementsByTagName('c');
              for (let cell of cells) {
                const style = cell.getAttribute('a');
                if (style && style === '17') {
                  // Si el estilo es de los encabezados, hacemos que el texto sea negrita
                  cell.setAttribute('t', 'inlineStr');
                  const istring = document.createElement('is');
                  const t = document.createElement('t');
                  t.textContent = cell.textContent; // el valor del título de la celda
                  istring.appendChild(t);
                  cell.textContent = '';
                  cell.appendChild(istring);
                  // Aplicamos estilo de texto negrita a los encabezados
                  cell.setAttribute('s', '17'); // '2' es el estilo en Excel para texto en negrita
                }
              }
            }
          },
        },
      ],
    };
    this.resultadoData= []
  }

  constructor(private servicesService: ServicesService) {}

  recibirResultados(data: any[]) {
    this.resultadosFiltrados = data;
    this.servicesService
      .post(`/frecuencia/getSearchCodif`, this.resultadosFiltrados)
      .subscribe((res: any) => {
        this.resultadoData = res.data;
      });
  }

}
