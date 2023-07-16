import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { CategoriaService } from 'src/app/services/categoria.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// import { Workbook } from 'exceljs';
// import * as fs from 'file-saver';


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
  public filtro = '';
  public token;
  public categorias: Array<any> = [];
  public arr_categorias: Array<any> = [];
  public url;
  public page = 1;
  public pageSize = 20;
  public load_btn = false;
  public svgString: string = '';
  public trustedSvgString: any;

  constructor(
    private _categoriaService: CategoriaService,
    private sanitizer: DomSanitizer
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
        // console.log(response);
        this.categorias = response.data;
        this.categorias.forEach(element => {
          this.arr_categorias.push({
            icono: this.trustedSvgString = this.sanitizer.bypassSecurityTrustHtml(element.icono),
            titulo: element.titulo,
            estado: element.estado,
            oferta: element.oferta,
            portada: element.portada,
            descuento_oferta: element.descuento_oferta,
            fin_oferta: element.fin_oferta
          });
          console.log(this.arr_categorias);
        });

        this.load_data = false;
      },

      error => {
        console.log(error);
      }
    )
  }

  filtrar() {
    if (this.filtro) {
      this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
        response => {
          // console.log(response);
          this.categorias = response.data;
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

  // donwload_excel() {
  //   let workbook = new Workbook();
  //   let worksheet = workbook.addWorksheet("Reporte de categorias");

  //   worksheet.addRow(undefined);
  //   for (let x1 of this.arr_productos) {
  //     let x2 = Object.keys(x1);

  //     let temp = []
  //     for (let y of x2) {
  //       temp.push(x1[y])
  //     }
  //     worksheet.addRow(temp)
  //   }

  //   let fname = 'REP01- ';

  //   worksheet.columns = [
  //     { header: 'Categoria', key: 'col1', width: 30 },
  //     { header: 'Stock', key: 'col2', width: 15 },
  //     { header: 'Precio', key: 'col3', width: 15 },
  //     { header: 'Categoria', key: 'col4', width: 25 },
  //     { header: 'N° ventas', key: 'col5', width: 15 },
  //   ] as any;

  //   workbook.xlsx.writeBuffer().then((data) => {
  //     let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     fs.saveAs(blob, fname + '-' + new Date().valueOf() + '.xlsx');

  //   });
  // }
}
