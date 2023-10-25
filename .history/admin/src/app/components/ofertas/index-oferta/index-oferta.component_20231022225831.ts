import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { OfertaService } from 'src/app/services/oferta.service';

declare var iziToast: any;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-index-oferta',
  templateUrl: './index-oferta.component.html',
  styleUrls: ['./index-oferta.component.css']
})

export class IndexOfertaComponent implements OnInit {

  public load_data = true;
  public filtro = '';
  public token;
  public ofertas: any[] = [];
  public url;
  public page = 1;
  public pageSize = 20;
  public load_btn = false;

  public selectedImage: string | undefined;
  public sortOrder: 'asc' | 'desc' = 'asc';


  constructor(
    private _ofertaService: OfertaService,
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      response => {
        this.ofertas = response.data;
        // console.log(this.ofertas);
        this.ofertas.forEach(element => {
          element.estado_oferta = (element.estado_oferta) ? "activo" : "inactivo";
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
      this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
        response => {
          this.ofertas = response.data;
          this.ofertas.forEach(element => {
            element.estado = (element.estado) ? "activo" : "inactivo";
            if (element.inicio === "undefined") {
              element.inicio = "0000-00-00";
            }
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
    this.ofertas.sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      // Handle special sorting for numeric values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Handle special sorting for date values
      if (valueA instanceof Date && valueB instanceof Date) {
        valueA = valueA.getTime();
        valueB = valueB.getTime();
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Perform alphabetical sorting for other values
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
      if (valueA < valueB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });

    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  eliminar(id: any) {
    this.load_btn = true;
    this._ofertaService.eliminar_oferta_admin(id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se eliminó correctamente el oferta.');
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

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    // $('#imageModal').modal('show');
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
