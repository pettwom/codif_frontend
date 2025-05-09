import {Injectable, NgZone} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {tap, map, catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {Observable, of} from 'rxjs';

import {environment} from '../../environments/environment';

// import { Usuario } from '../models/usuario.model';
import Swal from 'sweetalert2';

const apiUrl = environment.base_url;
const protocol = window.location.protocol.replace(':', '');
const PATERN_HOST = protocol === 'https' ? /(https:\/\/|www\.)\S+/i : /(http:\/\/|www\.)\S+/i;
const URL_SERVICIOS = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  public auth2: any;

  // public usuario: Usuario;

  constructor(public http: HttpClient,
              public router: Router,
              public ngZone: NgZone) {

    //this.googleInit();
  }


  // getFiles(): Observable<string[]> {
  //     return this.http.get<string[]>(`${FILE_URL}/contrato/anexos`);
  // }


  headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json",
    'Access-Control-Allow-Origin': '*',
    "token": localStorage.getItem('token') || ''
  })

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  guardarLocalStorage(token: string, menu: any, login: any, rol: any) {
    localStorage.setItem('login', login);
    localStorage.setItem('rol', rol);
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
  }

  login(loginAuth: object): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/login/signin`, loginAuth);
  }

  usuario_list(usuario_list: object): Observable<any> {
    return this.http.get(`${URL_SERVICIOS}/user/getListado`, usuario_list);
  }

  getDatosRep(): Observable<any> {
    return this.http.get(`${URL_SERVICIOS}/nacional/getDatosRep`);
  }

  // getProv(deptos:any): Observable <any>{
  //   return this.http.get(`${URL_SERVICIOS}/nacional/getProv/${deptos.depto}`);
  // }
  // getMun(provincia:any): Observable <any>{
  //   return this.http.post(`${URL_SERVICIOS}/nacional/getMun`, provincia);
  // }
  // getArea(arrayMunicipio:any): Observable <any>{
  //   return this.http.post(`${URL_SERVICIOS}/nacional/getArea`, arrayMunicipio);
  // }
  // getZona(arrayArea:any): Observable <any>{
  //   return this.http.post(`${URL_SERVICIOS}/nacional/getZona`, arrayArea);
  // }
  // getSector(arrayZona:any): Observable <any>{
  //   return this.http.post(`${URL_SERVICIOS}/nacional/getSector`, arrayZona);
  // }
  // getSubmit(arraySubmit:any): Observable <any>{
  //   return this.http.post(`${URL_SERVICIOS}/nacional/getSubmit`, arraySubmit);
  // }
  getPdf(): Observable<Blob> {
    return this.http.get(`${URL_SERVICIOS}/contrato/anexos`, {responseType: 'blob'});
  }

  // getPosition(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     navigator.geolocation.getCurrentPosition(resp => {
  //       resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
  //     },
  //       err => {
  //         reject(err);
  //       });
  //   });
  // }

  options(url) {
    return this._http('get', url + '/fields', '');
  }


  get(url, id = '') {
    // console.log('metodo---get : ' + url);
    return this._http('get', url, id);
  }

  get2(url, id = '') {
    return this.http.get(url);
  }

  post(url, data) {
    return this._http('post', url, data);
  }

  put(url, data) {
    return this._http('put', url, data);
  }

  patch(url, data) {
    return this._http('patch', url, data);
  }

  delete(url, id) {
    return this._http('delete', url, id);
  }

  download(url) {
    let urls = this.getUrl(url, '');

    let headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token.replace('\"', '').replace('\"', '')}`
    });

    return this.http.get(urls, {headers, responseType: "blob"});

  }

  async downloadPdf(contenidoDocumento, nombreArchivo, mimetype, tipo = 'blob', conPrevisualizacion = false) {
    if (contenidoDocumento) {
      var blob = contenidoDocumento;
      if (tipo === 'base64') {
        var binary = await atob(contenidoDocumento.replace(/\s/g, ''));
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
          view[i] = binary.charCodeAt(i);
        }
        blob = new Blob([view], {type: mimetype});
      }
      var url = URL.createObjectURL(blob);

      let w = 600;
      let h = 509;
      // var left = (screen.width/2)-(w/2);
      // var top = (screen.height/2)-(h/2);
      //ricky comento....descomentar..
      // var configuracion_ventana = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
      // const top = window.top.outerHeight / 2 + window.top.screenY - ( h / 2);
      // const left = window.top.outerWidth / 2 + window.top.screenX - ( w / 2);
      // var myWin = window.open(url);
      // setTimeout(function(){ myWin.document.title = 'my new title'; }, 1000);

      /* Con previsualizacion*/
      if (conPrevisualizacion) {
        let file = 'data:application/pdf;base64'
        let prntWin = window.open();
        prntWin.document.write("<html><head><title>" + nombreArchivo + "</title></head><body>"
          + '<iframe width="100%" height="100%" src="' + url + '" '
          + 'type="application/pdf" ></body></html>');
        prntWin.document.close();
      } else {
        var downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = nombreArchivo + ".pdf";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

    }

  }

  showPdfbase64(base64: any, nombreArchivo) {
    const linkSource = 'data:application/pdf;base64,' + base64;
    const downloadLink = document.createElement("a");
    const fileName = nombreArchivo + ".pdf";
    downloadLink.href = linkSource;
    downloadLink.target = '_blank';
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    //downloadLink.setAttribute('target', '_blank');
    downloadLink.click();
  }

  getUrl(url, id) {
    id = (typeof id === 'string' || typeof id === 'number') ? `${id}` : typeof id === 'object' && id.id ? `${id.id}` : '';
    if (url[url.length - 1] !== '/' && id.length > 1) {
      id = `/${id}`;
    }

    return PATERN_HOST.test(url) ? (url + id) : apiUrl + url + id;
    /// return  url + id;
  }

  handlingErrors(error) {
    console.log(error);

    if (error.response) {
      let status = error.response.status;
      let data = error.response.data;
      let states = [401, 403, 500]; // Estados que no mostrarán mensajes
      if (states.indexOf(status) === -1) {
        if (status === 408 || status === 504) {
          return data;
        } else {
          Swal.fire('Error', data, 'error');
        }
      } else {
        if (error.response.status === 401) {
          if (window.location.hash !== '#/login') {
            Swal.fire('Error', 'La session ha expirado, vuelva a login', 'error');
            this.router.navigateByUrl('/logout');
          }
        }
        if (error.response.status === 500) {
          if (window.location.hash !== '#/login') {
            Swal.fire('Error', error.message, 'error');
          }
        }
        if (error.response.status === 412) {
          if (window.location.hash !== '#/login') {
            Swal.fire('Error.', error.message, 'error');
          }
        }
      }
    } else if (error.message) {
      if (error.status === 401) {
        if (window.location.hash !== '#/login') {
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'La session ha expirado, vuelva a login',
            showConfirmButton: false,
            timer: 2000
          });
          this.router.navigateByUrl('/logout');
        }
      } else if (error.status === 404) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Has experimentado un error técnico. Pedimos disculpas.',
          showConfirmButton: false,
          timer: 2000
        });
      } else if (error.status === 412) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.error.message || error.error.mensaje,
          showConfirmButton: false,
          timer: 3000
        });
      } else if (error.status === 500 || error.status === 403) {
        /*
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.error.message,
          showConfirmButton: false,
          timer: 3000
        });

        // Regarcar la pagina
        this.router.navigateByUrl('logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 2500);
        });
*/
      } else if (error.status === 400) {
        Swal.fire({
          position: 'center',
          icon: 'info',
          title: error.error.message || error.error.mensaje,
          showConfirmButton: false,
          timer: 3000
        });
        // this.router.navigateByUrl('');
      } else if (error.message === 'Network Error') {
        Swal.fire('Error', 'connection', 'error');
      } else {
        Swal.fire(error.message, 'error');
      }
    } else {
      Swal.fire('Error', 'error desconocido', 'error');
    }
  }


  _http(method, url, data) {
    url = this.getUrl(url, data);

    /* if (process.env.DEBUG_MODE) {
      console.group('Petición con DataService:');
      console.info('URL:', method.toUpperCase(), url);
      if (data) {
        console.info('Params:', data);
      }
    } */

    let setting = {
      method,
      headers: {},
      url
    };

    if (typeof data === 'object' && Object.keys(data).length) {
      delete data.id;
      ///rickysetting.data = data;
    }

    // Set token in headers
    if (this.token) {
      setting.headers = {'Authorization': `Bearer ${this.token.replace('\"', '').replace('\"', '')}`};
    }

    if (method === 'get') {

      return this.http.get(url, setting)
        .pipe(
          catchError(error => {
            this.handlingErrors(error)
            return of([]);
          })
        );
    }
    if (method === 'post') {

      return this.http.post(url, data, setting)
        .pipe(
          catchError(error =>
            this.handlingErrors(error),
          )
        );
    }
    if (method === 'put') {

      return this.http.put(url, data, setting)
        .pipe(
          catchError(error =>
            this.handlingErrors(error),
          )
        );
    }
    if (method === 'patch') {
      return this.http.patch(url, data, setting);
    }
    if (method === 'delete') {
      return this.http.delete(url, setting);
    }
    if (method === 'download') {
      let headers = new HttpHeaders();
      headers = headers.set('Accept', 'application/pdf');


      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",

        }), responseType: 'text' as 'json'
      };

      return this.http.get(url, httpOptions);
    }

  }

  exportHTML(contenido, tituloDocumento) {
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      `<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title>
         <style>
         <!-- /* Style Definitions */
         p.MsoHeader, li.MsoHeader, div.MsoHeader{
             margin:0in;
             margin-top:.0001pt;
             mso-pagination:widow-orphan;
             tab-stops:center 3.0in right 6.0in;
         }
         p.MsoFooter, li.MsoFooter, div.MsoFooter{
             margin:0in 0in 1in 0in;
             margin-bottom:.0001pt;
             mso-pagination:widow-orphan;
             tab-stops:center 3.0in right 6.0in;
         }
         .footer {
             font-size: 9pt;
         }
         @page Section1{
             size:8.5in 11.0in;
             margin:1in 0.6in 1.2in 1.0in;
             mso-header-margin:0.5in;
             mso-header:h1;
             mso-footer:f1;
             mso-footer-margin:0.5in;
             mso-paper-source:0;
         }
         div.Section1{
             page:Section1;
         }
         table#hrdftrtbl{
             margin:0in 0in 0in 9in;
         }
         -->
         </style>
         <style type="text/css" media="screen,print">
         body {
             font-family: "Calibri", "Verdana","HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
             font-size:12pt;
         }
         pageBreak {
           clear:all;
           page-break-before:always;
           mso-special-character:line-break;
         }
         </style>

         </head><body>

         `;
    var footer33 = "<div style='mso-element:footer' id=f1><p class=MsoFooter><span style='mso-tab-count:1'></span><span style='mso-field-code:\" PAGE \"'></span> </p></div>";

    var footer = "</body></html>";

    var sourceHTML = header + '<div class="Section1">' + contenido + "</div>" + footer;

    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = tituloDocumento + '.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

}
