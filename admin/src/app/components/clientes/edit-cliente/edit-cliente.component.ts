import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { NgForm } from '@angular/forms';

declare var iziToast: any;

@Component({
  selector: 'app-edit-cliente',
  templateUrl: './edit-cliente.component.html',
  styleUrls: ['./edit-cliente.component.css']
})
export class EditClienteComponent implements OnInit {
  @ViewChild('updateForm', { static: false }) updateForm!: NgForm;


  public cliente: any = {};
  public id: any;
  public token;
  public isFormSubmitted = false;


  constructor(
    private _route: ActivatedRoute,
    private _clienteService: ClienteService,
    private _adminService: AdminService,
    private _router: Router,
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this._clienteService.obtener_cliente_admin(this.id, this.token).subscribe(
        response => {
          if (response.data == undefined) {
            this.cliente = undefined;
          } else {
            this.cliente = response.data;
          }
        },
        error => {
          // Handle error
        }
      );
    });
  }

  actualizar(updateForm: any) {
    this.isFormSubmitted = true;

    // Check form validity
    if (updateForm.valid) {
      this._clienteService.actualizar_cliente_admin(this.id, this.cliente, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se actualizó correctamente el nuevo cliente',
          });
          this._router.navigate(['/panel/clientes']);
        },
        error => {
          if (error.status === 400 && error.error.message === 'El email ya esta registrado.') {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'El email ya existe en la base de datos',
            });
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
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
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos',
      });
    }
  }


}