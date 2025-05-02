import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ServicesService } from './services.sevice';

const urlHost = environment.base_url;
@Injectable({
  providedIn: 'root'
})

export class ImageService {
  constructor(
    private http: HttpClient,
    private servicesService: ServicesService
  ) { }

  getImagesBase64(): Observable<{ [nombreImagen: string]: string }> {
    return this.http.get<{ [nombreImagen: string]: string }>(`${urlHost}/conteo/imagesAll`);
  }

  getImage(imageName: string) {
    if(imageName){
      imageName = imageName.replace('public/MapasCartografia/','')
    }
    // Reemplaza 'http://localhost:3000' con la URL de tu servidor Node.js
    return this.http.get(`${urlHost}/${imageName}`,{ responseType: 'blob' });

  }

  // upload(file: File): Observable<HttpEvent<any>> {
  //   const formData: FormData = new FormData();

  //   formData.append('file', file);

  //   const req = new HttpRequest('POST', `${urlHost}/upload`, formData, {
  //     reportProgress: true,
  //     responseType: 'json'
  //   });
  //   return this.http.request(req);
  // }
  // getFiles(): Observable<any> {
  //   return this.http.get(`${urlHost}/files`);
  // }
}
