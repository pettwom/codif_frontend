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
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css'],
})

export class CatalogosComponent implements OnInit {
  //? variables
  cuest_select: any;
  cat_select: any;
  option_cat: any;
  table_datos: any = [''];
  dtOptions: any = {};
  display: boolean = false;
  titulo: any;
  codigo: any;
  descripcion: any;
  id_catalogo: any;
  tipo: string;
  body_edit: {
    cuestionario: any;
    codigo: any;
    descripcion: any;
    id_catalogo: any;
  };
  body: {
    cuestionario: any;
    catalogo: any;
    codigo: any;
    descripcion: any;
    tipo: string;
  };

  //CORRECTOR
  listCorrector: any;
  updateCorrector: any;
  textErrada: any;
  textCorregida: any;
  displayCorrector: boolean = false;
  idCorrector: any;
  tituloHeader: any;
  resDatosCorrectorEditar: any;

  constructor(
    private servicesService: ServicesService,
    private element: ElementRef
  ) {}

  //? metodos
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
    this.cuest_select = '';
    this.cat_select = '';
    this.table_datos = [''];
    //corrector
    this.listCorrector = [''];
    this.getCorrector();
  }
  adicionar() {
    this.display = true;
    this.tipo = 'new';
    this.titulo = 'Adicionar Catalogo';
  }
  getCatalogo(): void {
    console.log(this.cuest_select, ' cuest select');

    this.servicesService
      .get(`/diccionario/getCatalogo/${this.cuest_select}`)
      .subscribe((res: any) => {
        this.option_cat = res.data;
        console.log(this.option_cat, 'option_cat');
      });
  }
  getDatos() {
    this.table_datos = [''];
    this.servicesService
      .get(`/diccionario/getDatos/${this.cuest_select}/${this.cat_select}`)
      .subscribe((res: any) => {
        this.table_datos = res.data;
      });
  }
  almacenar() {
    if (this.codigo == null && this.descripcion == null) {
      this.display = false;
      console.log(this.display);

      Swal.fire({
        title: 'Error!',
        text: 'Debe llenar los campos código y descripción.',
        icon: 'error',
        showConfirmButton: true,
        // timer: 1500,
      }).then((r) => {
        if (r.isConfirmed) {
          this.display = true;
        }
      });
    } else {
      this.display = false;
      Swal.fire({
        title: 'Confirmar acción',
        text: '¿Estás seguro de realizar esta acción?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Almacenar!',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          switch (this.tipo) {
            case 'new':
              this.body = {
                cuestionario: this.cuest_select,
                catalogo: this.table_datos[0].catalogo,
                codigo: this.codigo,
                descripcion: this.descripcion,
                tipo: 'new',
              };

              this.servicesService
                .post(`/diccionario/registerCatalogo`, this.body)
                .subscribe((res: any) => {
                  this.display = false;
                  this.getDatos();
                  Swal.fire({
                    title: res.title,
                    text: res.message,
                    icon: res.icon,
                    showConfirmButton: true,
                  }).then((r) => {
                    if (r.isConfirmed) {
                      this.getDatos();
                    }
                  });
                });
              break;
            case 'edit':
              this.body_edit = {
                cuestionario: this.cuest_select,
                codigo: this.codigo,
                descripcion: this.descripcion,
                id_catalogo: this.id_catalogo,
              };
              this.servicesService
                .put(`/diccionario/editRegister`, this.body_edit)
                .subscribe((res: any) => {
                  this.getDatos();
                  Swal.fire({
                    title: res.title,
                    text: res.message,
                    icon: res.icon,
                    showConfirmButton: false,
                    timer: 2500,
                  });
                });
          }
        }
      });
    }
    this.getDatos();
  }
  cancelar() {
    this.display = false;
  }
  editar(cod) {
    this.id_catalogo = cod;
    this.tipo = 'edit';
    this.display = true;
    this.titulo = 'Editar Catalogo';
    this.servicesService
      .get(`/diccionario/getDatosCatalogo/${cod}`)
      .subscribe((res: any) => {
        console.log(res.data);

        this.codigo = res.data[0].codigo;
        this.descripcion = res.data[0].descripcion;
      });
  }
  eliminarRegistro(cod) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: 'Esto eliminará permanentemente el registro.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicesService
          .put(`/diccionario/deleteRegister/`, { cod: cod })
          .subscribe((res: any) => {
            Swal.fire({
              title: 'Registro eliminado!',
              text: 'El registro ha sido eliminado con éxito.',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500,
            });
            this.getDatos();
          });
      }
    });
  }

  //CORRECTOR
  getCorrector() {
    this.listCorrector = [''];
    this.servicesService
      .get(`/diccionario/getListarCorrector`)
      .subscribe((res: any) => {
        this.listCorrector = res.data;
      });
  }

  //editar corrector
  editarModalCorrector(id) {
    this.idCorrector = id;
    this.tipo = 'edit';
    this.tituloHeader = 'Editar Corrección';
    this.displayCorrector = true;
    this.servicesService
      .get(`/diccionario/getDatosCorrector/${this.idCorrector}`)
      .subscribe((res: any) => {
        this.textErrada = res.data[0].erradas;
        this.textCorregida = res.data[0].corregidas;
      });
  }
  almacenarDatos(tipo, id = null) {
    this.servicesService
      .put(`/diccionario/updateCorrector`, {
        ids: id,
        corregidas: this.textCorregida,
        erradas: this.textErrada,
        tipo: tipo?tipo:''
      })
      .subscribe((res: any) => {
        if (res.success == true) {
          this.displayCorrector = false;
          this.getCorrector();
          Swal.fire({
            title: res.title,
            icon: res.icon,
            text: res.message,
            timer: 2500,
            showConfirmButton: false,
          });
        }
        this.updateCorrector = res.data;
      });
  }
  eliminarCorrector(id) {
    try {
      Swal.fire({
        title: 'Eliminar',
        icon: 'info',
        text: 'Desea Confirmar la eliminación de este registro?',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Si, confirmo',
        cancelButtonText: 'No',
        confirmButtonColor: '#e04440',
      }).then((res) => {
        if (res.isConfirmed) {
          this.servicesService
            .put(`/diccionario/deleteCorrector`, { ids: id })
            .subscribe((res: any) => {
              this.displayCorrector = false;
              this.getCorrector();
              Swal.fire({
                title: res.title,
                icon: res.icon,
                text: res.message,
                timer: 2500,
                showConfirmButton: false,
              });
            });
        }
      });
    } catch (e) {
      Swal.fire({
        title: 'Error',
        icon: 'error',
        text: e.message,
        timer: 2500,
        showConfirmButton: false,
      });
    }
  }
  addModelCorrector(){
    this.tipo = 'new';
    this.tituloHeader = 'Adicionar Corrección';
    this.displayCorrector = true;
  }
  adicionarCorrector() {
    Swal.fire({
      title: 'Eliminar',
      icon: 'info',
      text: 'Desea Confirmar la eliminación de este registro?',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si, confirmo',
      cancelButtonText: 'No',
      confirmButtonColor: '#e04440',
    }).then((res) => {
      if (res.isConfirmed) {
        try{
        this.servicesService
          .post(`/diccionario/addCorrector`, {
            corregidas: this.textCorregida,
            erradas: this.textErrada,
          })
          .subscribe((res: any) => {
            Swal.fire({
              title: res.title,
              icon: res.icon,
              text: res.message,
              timer: 2500,
              showConfirmButton: false,
            });
          });
        }catch(e){
          Swal.fire({
            title: 'Error',
            icon: 'error',
            text: e.message,
            timer: 2500,
            showConfirmButton: false,
          });
        }
      }
    });
  }
}
