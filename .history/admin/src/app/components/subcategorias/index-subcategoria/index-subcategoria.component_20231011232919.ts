import { Component, OnInit } from '@angular/core';
import { SubcategoriaService } from 'src/app/services/subcategoria.service';


declare var $: any;
declare var iziToast: any;


@Component({
  selector: 'app-index-subcategoria',
  templateUrl: './index-subcategoria.component.html',
  styleUrls: ['./index-subcategoria.component.css']
})
export class IndexSubcategoriaComponent implements OnInit {
  load_data = true;
  filtro = '';
  token: any;
  subcategorias: any[] = [];
  url: any;
  page = 1;
  pageSize = 20;
  load_btn = false;
  sanitizedSvgContent: any;
  selectedImage: string | undefined;
  sortOrder: 'asc' | 'desc' = 'asc';
  categorySortOrder: 'asc' | 'desc' = 'asc';
  offerSortOrder: 'asc' | 'desc' = 'asc';

  constructor(private _subcategoriaService: SubcategoriaService) {
    this.token = localStorage.getItem('token');
    this.url = 'your-URL-here'; // Replace with your URL.
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this._subcategoriaService.listar_subcategorias_admin(this.filtro, this.token).subscribe(
      response => {
        this.subcategorias = response.data;
        this.subcategorias.forEach(element => {
          element.estado_subcategoria = element.estado_subcategoria ? 'activo' : 'inactivo';
        });
        this.load_data = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  formatDate(dateString: string | undefined): string {
    const defaultDate = new Date(2000, 0, 1); // January 1, 2000
    const dateToFormat = dateString ? new Date(dateString) : defaultDate;
    return dateToFormat.toISOString().slice(0, 19).replace('T', ' ');
  }

  filtrar() {
    if (this.filtro) {
      this._subcategoriaService.listar_subcategorias_admin(this.filtro, this.token).subscribe(
        response => {
          this.subcategorias = response.data;
          this.subcategorias.forEach(element => {
            element.estado_subcategoria = element.estado_subcategoria ? 'activo' : 'inactivo';
            if (element.fin_oferta === 'undefined') {
              element.fin_oferta = '0000-00-00';
            }
          });
          this.load_data = false;
        },
        error => {
          console.log(error);
        }
      );
    } else {
      iziToast.error({
        title: 'ERROR',
        message: 'Ingrese un filtro para buscar'
      });
    }
  }

  resetar() {
    this.filtro = '';
    this.init_data();
  }

  sort(key: string) {
    this.subcategorias.sort((a, b) => {
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

  sortCategory() {
    this.categorySortOrder = this.categorySortOrder === 'asc' ? 'desc' : 'asc';

    this.subcategorias.sort((a, b) => {
      const result = a.categoria_subcategoria.nombre_categoria.localeCompare(b.categoria_subcategoria.nombre_categoria);
      return this.categorySortOrder === 'asc' ? result : -result;
    });
  }

  sortOffer() {
    this.offerSortOrder = this.offerSortOrder === 'asc' ? 'desc' : 'asc';

    this.subcategorias.sort((a, b) => {
      const result = a.ofertas_subcategoria[0].nombre_oferta.localeCompare(b.ofertas_subcategoria[0].nombre_oferta);
      return this.offerSortOrder === 'asc' ? result : -result;
    });
  }

  eliminar(id: any) {
    this.load_btn = true;
    this._subcategoriaService.eliminar_subcategoria_admin(id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se eliminó correctamente el subcategoria.');
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
    );
  }

  showErrorMessage(message: string) {
    iziToast.error({
      title: 'ERROR',
      message: message
    });
  }

  showSuccessMessage(message: string) {
    iziToast.success({
      title: 'SUCCESS',
      message: message
    });
  }
}
