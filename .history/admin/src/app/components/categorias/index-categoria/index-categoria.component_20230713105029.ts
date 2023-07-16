import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { CategoriaService } from 'src/app/services/categoria.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


declare var iziToast: any;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-index-categoria',
  templateUrl: './index-categoria.component.html',
  styleUrls: ['./index-categoria.component.css']
})
export class IndexCategoriaComponent implements OnInit {
  public load_data = true;
  public token;
  public categorias: Array<any> = [];
  public url;
  public page = 1;
  public pageSize = 20;
  public load_btn = false;
  public svgString: string = '';
  public trustedSvgString: any;

  constructor(
    private _categoriaService: CategoriaService,
    private sanitizer: DomSanitizer,
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this._categoriaService.listar_categorias_admin(this.token).subscribe(
      response => {
        // console.log(response);
        this.categorias = response.data;
        this.categorias.forEach(element => {
          element.icono = this.trustedSvgString = this.sanitizer.bypassSecurityTrustHtml(element.icono);
        });
        console.log(this.categorias);

        this.load_data = false;
      },

      error => {
        console.log(error);
      }
    )
  }


  eliminar(id: any) {
    this.load_btn = true;
    this._categoriaService.eliminar_categoria_admin(id, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se eliminó correctamente el categoria.'
        });

        $('#delete-' + id).modal('hide');
        $('.modal-backdrop').removeClass('show');

        this.load_btn = false;

        this.init_data();


      },
      error => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Ocurrió un error en el servidor.'
        });
        console.log(error);
        this.load_btn = false;
      }
    )
  }

}
