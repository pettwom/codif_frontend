import { Component, OnInit } from '@angular/core';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import 'select2';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})

export class RolesComponent implements OnInit {
  dtOptions: any = {};
  listUser: any=[''];
  listRoles: any=[''];
  userId: any = 0;
  rol_input:any;
  seleccionados: any;
  selectDisabled: boolean;
  listCuest: any;
  dtTrigger: Subject<any> = new Subject<any>();
  i: number;
  users: any;
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
    if (this.dtTrigger) {
      this.dtTrigger.next(null);
    }
    this.listUser = [''];
    this.listRoles = [''];
    this.getListUser();
    this.getListRoles();
  }

  ngAfterViewInit(): void {
    ($('#select2') as any).select2({
      placeholder: 'Seleccione una opción',
      allowClear: true,
      theme: "classic",
    });
    const select2Container = $('#select2').data('select2');
    if (select2Container) {
      $(select2Container).css({
        height: '45px',
        minHeight: '45px', // Asegura que la altura no colapse
        lineHeight: '45px', // Centra el texto verticalmente
      });

      // Ajusta el control dentro del contenedor
      $(select2Container).find('.select2-selection').css({
        height: '100%',
        padding: '0',       // Elimina el padding por defecto
        display: 'flex',
        alignItems: 'center',  // Centra verticalmente
      });
      $(select2Container).find('.select2-selection__rendered').css({
         lineHeight: '45px'
      });
    } else {
      console.error('Select2 no está disponible.');
    }
  }
  getListUser(){
    this.servicesService.get(`/administracion/getListUser`)
    .subscribe((res:any)=>{
      this.listUser = res.data;
      this.users = res.userData;
    })
  }
  getListRoles(){
    this.servicesService.get(`/administracion/getListRoles`)
    .subscribe((res:any)=>{
      this.listRoles = res.data;
    })
  }
  onSelectRow(row: any, index: number): void {
    if(row.selected == true) {
      this.selectDisabled = false;
    }else{
      this.selectDisabled = true;
    }
    console.log(row);

    this.seleccionados.push(row.rep_id);
  }
  selectAll(event: any): void {
    const isChecked = event.target.checked;
    this.listUser.forEach((item) => {
      item.selected = isChecked; // Marcar todas las filas según el estado del checkbox
      this.seleccionados.push(item.rep_id);
      console.log(item.selected );

      if(item.selected == true ){
        this.selectDisabled = false;
        // this.btnDisabled = false;
      }else{
        this.selectDisabled = true;
        // this.btnDisabled = true;
      }
    });
  }
  getSelectedRows(): any[] {
    return this.listCuest.filter((item) => item.selected); // Filtrar las filas seleccionadas
  }
}
