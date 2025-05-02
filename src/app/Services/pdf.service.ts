import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServicesService } from './services.sevice';
const BASE_URL = environment.base_url;
@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private baseUrl = BASE_URL+ '/pdf';
  // private baseUrl = 'http://localhost:3000/api/pdf';

  constructor(
    private http: HttpClient,
    private serviceService: ServicesService
  ) {}

  upload(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    console.log('FormData:', formData.get('file'));  // Verificación
    console.log('FormData:', formData);  // Verificación
    // return this.http.post(`/conflictos/upload`, formData);
    return this.serviceService.post(`${this.baseUrl}/upload`, formData);
  }

  // getFiles(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}`);
  // }

  // download(filename: string): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/download/${filename}`, { responseType: 'blob' });
  // }
}
