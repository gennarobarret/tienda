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


  load_data = true;
  filtro = '';
  token;
  categorias: any[] = [];
  url;
  page = 1;
  pageSize = 20;
  load_btn = false;
  sanitizedSvgContent: any;
  sortOrder: 'asc' | 'desc' = 'asc';
  offerSortOrder: 'asc' | 'desc' = 'asc';


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
    this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
      response => {
        this.categorias = response.data;
        console.log(this.categorias);
        this.categorias.forEach(element => {
          element.icono_categoria = this.sanitizedSvgContent = this.sanitizer.bypassSecurityTrustHtml(element.icono_categoria);
          element.estado_categoria = (element.estado_categoria) ? "activo" : "inactivo";
        });
        this.load_data = false;
      },

      error => {
        console.log(error);
      }
    )
  }

  formatDate(dateString: string | undefined): string {
    const defaultDate = new Date(2000, 0, 1); // January 1, 2000
    const dateToFormat = dateString ? new Date(dateString) : defaultDate;
    const formattedDate = dateToFormat.toISOString().slice(0, 19).replace('T', ' '); // Formato yyyy-MM-dd HH:mm:ss
    return formattedDate;
  }

  filtrar() {
    if (this.filtro) {
      this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
        response => {
          this.categorias = response.data;
          this.categorias.forEach(element => {
            element.icono_categoria = this.sanitizedSvgContent = this.sanitizer.bypassSecurityTrustHtml(element.icono_categoria);
            element.estado_categoria = (element.estado_categoria) ? "activo" : "inactivo";
            element.oferta = (element.oferta) ? "activo" : "inactivo";
            if (element.fin_oferta === "undefined") {
              element.fin_oferta = "0000-00-00";
            }
          });
          this.load_data = false;
        },
        error => {
          console.log(error);

        }
      )
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese un filtro para buscar'
      });
    }
  }

  resetar() {
    this.filtro = '';
    this.init_data();
  }

  sort(key: string) {
    this.categorias.sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (valueA instanceof Date && valueB instanceof Date) {
        valueA = valueA.getTime();
        valueB = valueB.getTime();
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
      return this.sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });

    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  eliminar(id: any) {
    this.load_btn = true;
    this._categoriaService.eliminar_categoria_admin(id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se eliminó correctamente el categoria.');
        $('#delete-' + id).modal('hide');
        $('.modal-backdrop').removeClass('show');
        this.load_btn = false;
        this.init_data();
      },
      error => {
        this.showErrorMessage('Ocurrió un error en el servidor.');
        console.log(error);
        this.load_btn = false;
      }
    )
  }

  showErrorMessage(message: string) {
    iziToast.show({
      title: 'ERROR',
      titleColor: '#FF0000',
      color: '#FFF',
      class: 'text-danger',
      position: 'topRight',
      message: message
    });
  }

  showSuccessMessage(message: string) {
    iziToast.show({
      title: 'SUCCESS',
      titleColor: '#1DC74C',
      color: '#FFF',
      class: 'text-success',
      position: 'topRight',
      message: message
    });
  }


}
