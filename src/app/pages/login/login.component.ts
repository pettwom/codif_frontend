import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form_login!: FormGroup;
  formReset!: FormGroup;
  eyes_icon: any = 'mdi mdi-eye-off-outline'; //icono de password
  token1: string | undefined;
  botonTexto: any = 'Iniciar Sesión'; //texto de boton
  botonEstado: any = true;
  recordarme: boolean = false;
  user: any;
  pass: any;
  carnet: any;
  pass_new: any;
  repeat_pass: any;
  icon_pass: any = 'mdi mdi-eye-off-outline'; //icono de password;
  icon_new: any = 'mdi mdi-eye-off-outline'; //icono de password;
  icon_repeat: any = 'mdi mdi-eye-off-outline'; //icono de password;
  resetCI: any;
  resetPass1: any;
  resetPass2: any;
  pass1: any;
  pass2:any;
  navegador: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private auth: UsuarioService,
    private ServicesService: ServicesService
  ) {
    this.token1 = undefined;
  }

  ngOnInit() {

    let token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/admin']);
    }

    this.form_login = new FormGroup({
      usuario: new FormControl(''),
      password: new FormControl(''),
      recordarme: new FormControl(''),
    });
    this.formReset = new FormGroup({
      ci: new FormControl(''),
      pass_new: new FormControl(''),
      repeat_pass: new FormControl(''),
    });

    this.form_login = this.formBuilder.group({
      usuario: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      recordarme: ['', []],
    });
    this.formReset = this.formBuilder.group({
      ci: ['', [Validators.required, Validators.minLength(8)]],
      pass_new: ['', [Validators.required, Validators.minLength(8)]],
      repeat_pass: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.form_login.controls['usuario'].setValue('');
    this.form_login.controls['password'].setValue('');
  }

  eyes_passw(eyes_icon, input_type, icon) {
    let view_eyes = document.querySelector('#' + eyes_icon);
    let eyes_password: any = document.querySelector('#' + input_type);
    if (eyes_password.type == 'password') {
      eyes_password.type = 'text';
      switch (icon) {
        case 'pass':
          this.icon_pass = 'mdi mdi-eye-outline color_verde';
          break;
        case 'new':
          this.icon_new = 'mdi mdi-eye-outline color_verde';
          break;
        case 'repeat':
          this.icon_repeat = 'mdi mdi-eye-outline color_verde';
          break;
      }
    } else {
      switch (icon) {
        case 'pass':
          this.icon_pass = 'mdi mdi-eye-off-outline';
          break;
        case 'new':
          this.icon_new = 'mdi mdi-eye-off-outline';
          break;
        case 'repeat':
          this.icon_repeat = 'mdi mdi-eye-off-outline';
          break;
      }
      eyes_password.type = 'password';
    }
  }
  teclado() {
    if (
      this.form_login.controls['usuario'].value != '' ||
      this.form_login.controls['usuario'].value != ''
    ) {
      this.botonEstado = false;
    }
  }

  // resetPass() {
  //   console.log('reset');

  //   this.carnet = this.formReset.controls['ci'].value;
  //   this.auth.verificar_usuario(this.carnet).subscribe((res: any) => {
  //     if (res.data == 'ok') {
  //       this.pass_new = this.formReset.controls['pass_new'].value;
  //       this.repeat_pass = this.formReset.controls['repeat_pass'].value;

  //       console.log(this.pass_new, 'password nuevo');
  //       console.log(this.repeat_pass, 'repetir password');

  //       if (this.pass_new) {
  //         if (this.repeat_pass) {
  //           if (this.pass_new != this.repeat_pass) {
  //             Swal.fire({
  //               position: 'center',
  //               icon: 'error',
  //               title:
  //                 'Las contraseñas introducidas no son iguales, favor intentar nuevamente!!',
  //               showConfirmButton: false,
  //               timer: 2500,
  //             });
  //           } else {
  //             Swal.fire({
  //               position: 'center',
  //               icon: 'success',
  //               title: 'Se reseteo la contraseña correctamente!!',
  //               showConfirmButton: false,
  //               timer: 2500,
  //             });
  //           }
  //         }
  //       }
  //     }
  //   });
  // }
  onSubmit() {
    this.user = this.form_login.controls['usuario'].value;
    this.pass = this.form_login.controls['password'].value;
    this.recordarme = this.form_login.controls['recordarme'].value;
    this.navegador = window.navigator.userAgent.toLowerCase()


    this.auth.login({'login': this.form_login.value, 'navegador': this.navegador}).subscribe(
      (res: any) => {
        // winter
        /*
        Swal.fire({
          position: 'center',
          icon: res.icon,
          title: res.message,
          showConfirmButton: false,
          timer: 3500,
        });
         */

        // console.log(res.menu);

        localStorage.setItem('id', JSON.stringify(res.users.id_usuario));
        localStorage.setItem('token', res.token);
        localStorage.setItem('menu', JSON.stringify(res.menu));
        localStorage.setItem('nombre', res.users.nombre);
        localStorage.setItem('grupo', res.users.grupoUsuario);
        // localStorage.setItem(
        //   'codigo_departamento',
        //   res.users.codigo_departamento
        // );
        // localStorage.setItem(
        //   'descripcion_departamento',
        //   res.users.descripcion_departamento
        // );
        localStorage.setItem('login', JSON.stringify(res.users.login));
        localStorage.setItem('rutaDefecto', res.users.ruta_defecto);
        localStorage.setItem(
          'tipo_usuario',
          JSON.stringify(res.users.tipo_usuario)
        );
        localStorage.setItem('id_usuario', res.users.id_usuario);
        localStorage.setItem('id_rol', JSON.stringify(res.users.id_rol));
        this.router.navigate(['/admin']);
      },
      (error) => {
        Swal.fire({
          position: 'center',
          icon: error.error.icon,
          title: error.error.message,
          showConfirmButton: false,
          timer: 3000,
        });
      }
    );
  }

  resetearPassword() {
    this.resetCI = this.formReset.controls['ci'].value;
    this.resetPass1 = this.formReset.controls['pass_new'].value;
    this.resetPass2 = this.formReset.controls['repeat_pass'].value;
    this.pass1 = document.getElementById('pass_new')
    this.pass2 = document.getElementById('repeat_pass')
    if (this.resetPass1 != this.resetPass2) {
      this.pass1.style.borderColor = 'red'
      this.pass2.style.borderColor = 'red'
      Swal.fire({
        icon: 'info',
        title: 'Verificar',
        text: 'Las contraseñas no son iguales intente nuevamente!!',
      });
    }else{
      this.pass1.style.borderColor = '#bbbcc4'
      this.pass2.style.borderColor = '#bbbcc4'
      this.ServicesService.post(`/login/resetear`,{'carnet': this.resetCI, 'pass':this.resetPass1})
      .subscribe((res:any)=>{
          Swal.fire({
            title: res.title,
            icon: res.icon,
            text: res.message
          })

      })
    }
  }

}
