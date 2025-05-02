import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: '',
})
export class LogoutComponent {

  constructor(
    private _router: Router
  ) { }

  ngOnInit() {
    localStorage.clear();
    this._router.navigate(['login']);
  }

}
