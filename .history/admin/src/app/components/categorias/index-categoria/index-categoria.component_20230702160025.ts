import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { CategoriaService } from 'src/app/services/categoria.service';

declare var iziToast: any;
declare var jQuery: any;
declare var $: any;


@Component({
  selector: 'app-index-categoria',
  templateUrl: './index-categoria.component.html',
  styleUrls: ['./index-categoria.component.css'],
})

export class IndexCategoriaComponent implements OnInit {
  public categorias: Array<any> = [];
  public filtro_company = '';
  public filtro_correo = '';

  public page = 1;
  public pageSize = 20;
  public token;
  public load_data = true;

  constructor(
    private _categoriaService: CategoriaService,
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data() {
    this._categoriaService
      .listar_categorias_admin(null, null, this.token)
      .subscribe(
        (response) => {
          this.categorias = response.data;
          this.load_data = false;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  filtro(tipo: any) {
    var filtro;
    if (tipo == 'company') {
      if (this.filtro_company) {
        this._categoriaService
          .listar_categorias_admin(tipo, this.filtro_company, this.token)
          .subscribe(
            (response) => {
              this.categorias = response.data;
              this.load_data = false;
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
        this.init_Data();
      }
    } else if (tipo == 'correo') {
      if (this.filtro_correo) {
        this._categoriaService
          .listar_categorias_admin(tipo, this.filtro_correo, this.token)
          .subscribe(
            (response) => {
              this.categorias = response.data;
              this.load_data = false;
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
        this.init_Data();
      }
    }
  }

  // eliminar(id: any) {
  //   this._categoriaService.eliminar_proveedor_admin(id, this.token).subscribe(
  //     respose => {
  //       iziToast.show({
  //         title: 'SUCCESS',
  //         titleColor: '#1DC74C',
  //         color: '#FFF',
  //         class: 'text-success',
  //         position: 'topRight',
  //         message: 'Se elimino correctamente el categoria',
  //       });

  //       $('#delete-' + id).modal('hide');
  //       $('.modal-backdrop').removeClass('show');
  //       this.init_Data();

  //     }, error => {
  //       console.log(error);
  //     }
  //   )
  // }
}