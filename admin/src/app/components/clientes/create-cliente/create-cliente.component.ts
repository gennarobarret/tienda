import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { NgForm } from '@angular/forms';

declare var iziToast: any;

@Component({
  selector: 'app-create-cliente',
  templateUrl: './create-cliente.component.html',
  styleUrls: ['./create-cliente.component.css'],
})

export class CreateClienteComponent implements OnInit {

  @ViewChild('clienteForm', { static: false }) clienteForm!: NgForm;

  public formSubmitted = false;

  public cliente: any = { genero: '' };
  public token: any;

  constructor(
    private _clienteService: ClienteService,
    private _adminService: AdminService,
    private _router: Router
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void { }

  registro() {

    this.formSubmitted = true;

    if (this.clienteForm.valid) {
      this._clienteService
        .registro_cliente_admin(this.cliente, this.token)
        .subscribe(
          (response) => {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se registró correctamente el nuevo cliente',
            });
            this.cliente = {
              nombres: '',
              apellidos: '',
              email: '',
              telefono: '',
              f_nacimiento: '',
              dni: '',
              genero: '',
            };
            this._router.navigate(['/panel/clientes']);
          },
          (error) => {
            if (
              error.status === 404 &&
              error.error.message === 'El email ya está registrado.'
            ) {
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-Danger',
                position: 'topRight',
                message: 'El email ya existe en la base de datos',
              });
            } else {
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-Danger',
                position: 'topRight',
                message: 'Ocurrió un error en el registro',
              });
            }
          }
        );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-Danger',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos',
      });
      return;
    }
  }
}

