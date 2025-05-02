import { Component, OnInit } from '@angular/core';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-automaticas',
  templateUrl: './automaticas.component.html',
  styleUrls: ['./automaticas.component.css'],
})
export class AutomaticasComponent implements OnInit {
  dtOptions: any = {};
  listado: any;
  paso1: any = 'Procesando!!';
  paso2: any = 'Procesando!!';
  paso3: any = 'Procesando!!';
  paso4: any = 'Procesando!!';
  paso5: any = 'Procesando!!';
  paso6: any = 'Procesando!!';

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
    this.getListado();
    this.listado = [''];
  }
  getListado() {
    this.servicesService
      .get(`/codificacion/getListado`)
      .subscribe((res: any) => {
        this.listado = res.data;
      });
  }
  generarCodificacion() {
    Swal.fire({
      title: 'Generar',
      icon: 'info',
      text: 'Desea iniciar el proceso de generacion de datos codificados?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Si, estoy Seguro',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarFuncionesConRetraso();
      }
    });
  }

  async ejecutarFuncionesConRetraso() {
    await this.delay(1000);  // Espera 1 segundo antes de ejecutar la siguiente función
    this.paso1Function();

    await this.delay(1000);  // Espera 1 segundo
    this.paso2Function();

    await this.delay(1000);  // Espera 1 segundo
    this.paso3Function();

    await this.delay(1000);  // Espera 1 segundo
    this.paso4Function();

    await this.delay(1000);  // Espera 1 segundo
    this.paso5Function();

    await this.delay(1000);  // Espera 1 segundo
    this.paso6Function();

    await this.delay(1000);
    Swal.fire({
      title: 'Correcto',
      icon: 'success',
      text: 'Se completo correctamente la codificación automática',
      timer:2500
    })
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  paso1Function() {
    this.servicesService
      .get(`/codificacion/paso1`)
      .subscribe((res: any) => (this.paso1 = res.data));
  }
  paso2Function() {
    this.servicesService
      .get(`/codificacion/paso2`)
      .subscribe((res: any) => (this.paso2 = res.data));
  }
  paso3Function() {
    this.servicesService
      .get(`/codificacion/paso3`)
      .subscribe((res: any) => (this.paso3 = res.data));
  }
  paso4Function() {
    this.servicesService
      .get(`/codificacion/paso4`)
      .subscribe((res: any) => (this.paso4 = res.data));
  }
  paso5Function() {
    this.servicesService
      .get(`/codificacion/paso5`)
      .subscribe((res: any) => (this.paso5 = res.data));
  }
  paso6Function() {
    this.servicesService
      .get(`/codificacion/paso6`)
      .subscribe((res: any) => (this.paso6 = res.data));
  }
}
