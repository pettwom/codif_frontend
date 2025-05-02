import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  show(): void {
    console.log(localStorage.getItem('id_usuario'));
    this._loading.next(true);
  }

  hide(): void {
    this._loading.next(false);
  }
}
