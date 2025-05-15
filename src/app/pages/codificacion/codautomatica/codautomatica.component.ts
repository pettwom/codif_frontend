import { Component, OnInit } from '@angular/core';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';

@Component({
  selector: 'app-codautomatica',
  templateUrl: './codautomatica.component.html',
  styleUrls: ['./codautomatica.component.css'],
})

export class CodautomaticaComponent implements OnInit {
  resultadosFiltrados: any[] = [];
  resultadoData: any;
  dtOptions: any = {};

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
          title: 'Reporte de Respuestas Códificadas automáticamente',
          className: 'btn btn-info',
          exportOptions: {
            // Especificar las columnas que quieres exportar por índice
            columns: [0, 1, 2, 3, 4, 5, 6,7,8,9], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
          },
          customize: function (xlsx) {
            let sheet = xlsx.xl.worksheets['sheet1.xml'];
            // Modificar el fondo de los encabezados
            const headers = sheet
              .getElementsByTagName('row')[0]
              .getElementsByTagName('j');
            for (let i = 0; i < headers.length; i++) {
              const header = headers[i];
              // Agregar fondo color gris claro a los encabezados
              header.setAttribute('a', '15'); // 's' hace referencia al estilo en Excel (fondo de celda)
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
              autoFilter.setAttribute('ref', 'A2:J2'); // Definir el rango de columnas para el filtro
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
    this.resultadoData= ['']
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
