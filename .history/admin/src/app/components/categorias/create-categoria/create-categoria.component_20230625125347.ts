import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var iziToast: any;

@Component({
  selector: 'app-create-categoria',
  templateUrl: './create-categoria.component.html',
  styleUrls: ['./create-categoria.component.css']
})


export class CreateCategoriaComponent {

  public token;
  public config: any = {};
  public url;

  public titulo_cat = '';
  public icono_cat = '';
  public file: File = undefined;
  public imgSelect: string | ArrayBuffer | undefined;
  public load_btn = false;

  constructor(
    private _adminService: AdminService
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    this._adminService.obtener_config_admin(this.token).subscribe(
      response => {
        this.config = response.data;
        this.imgSelect = this.url + 'obtener_logo/' + this.config.logo;
        console.log(this.config);

      },
      error => {
        console.log(error);

      }
    );
  }
  registro(registroForm: any) {
    if (registroForm.valid) {
      // console.log(this.categoria);
      console.log(this.file);
      this.load_btn = true;
      this._productoService.registro_producto_admin(this.categoria, this.file, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se registro correctamente el nuevo categoria.'
          });
          this.load_btn = false;

          this._router.navigate(['/panel/categorias']);
        },
        error => {
          console.log(error);
          this.load_btn = false;
        }
      );
    }


  }

}
