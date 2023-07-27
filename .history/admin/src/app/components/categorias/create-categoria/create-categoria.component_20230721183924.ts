import { Component, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { CategoriaService } from 'src/app/services/categoria.service';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare let iziToast: any;
declare let jQuery: any;
declare let $: any;

@Component({
  selector: 'app-create-categoria',
  templateUrl: './create-categoria.component.html',
  styleUrls: ['./create-categoria.component.css']
})
export class CreateCategoriaComponent {
  @ViewChild('categoriaForm', { static: false }) categoriaForm!: NgForm;

  public file: any = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public config: any = {};
  public token;
  public load_btn = false;
  public config_global: any = {};
  public formSubmitted = false;
  public categoria: any = {
    estado: '',
    oferta: ''
  };

  showViewer: boolean = false;
  showInvalidSvg: boolean = false;
  sanitizedSvgCode: SafeHtml = '';
  showNotificationError: boolean = false;

  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.config = {
      height: 500
    }
    this.token = this._adminService.getToken();
  }

  validateSvgCode() {
    const svgCode = this.categoria.icono;
    const svgRegex = /^<svg[\s\S]*<\/svg>$/i;
    const isValidSvg = svgRegex.test(svgCode);

    if (isValidSvg) {
      this.showViewer = true;
      this.showInvalidSvg = false;
      this.sanitizedSvgCode = this.sanitizer.bypassSecurityTrustHtml(svgCode);
    } else {
      this.showViewer = false;
      this.showInvalidSvg = svgCode !== '';
      this.sanitizedSvgCode = '';
      // Check if the input is empty, and if so, set the icono control as touched to trigger validation
      if (!svgCode) {
        this.categoriaForm.controls['icono'].markAsTouched();
      }
    }
  }

  ofertaInactive() {
    console.log(this.categoria.oferta);
    if (this.categoria.oferta === '0') {
      this.categoria.descuento_oferta = '0';
      this.showNotificationError = false;
    } else {
      this.categoria.descuento_oferta = '';
    }
  }


  applyDiscountRange() {
    if (this.categoria.descuento_oferta > 100) {
      this.categoria.descuento_oferta = 100;
    } else if (this.categoria.descuento_oferta < 0) {
      this.categoria.descuento_oferta = 0;
    }
    if (this.categoria.descuento_oferta !== '0') {
      this.showNotificationError = false;
    } else {
      this.showNotificationError = true;
      console.log('salta true');
    }
  }

  restrictInput(event: any) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  limitInputLength(event: any) {
    const inputValue = event.target.value;
    if (inputValue.length > 3) {
      event.target.value = inputValue.slice(0, 3);
    }
  }

  resetForm() {
    // if (this.categoria['oferta'] == null) {
    this.categoria = {
      estado: '',
      oferta: '' // Set the value of 'oferta' to an empty string
    };
    // }
    this.categoriaForm.resetForm(); // Reset the form
    this.showViewer = false;
    this.showInvalidSvg = false;
    this.showNotificationError = false;
  }


  registro() {
    this.formSubmitted = true;
    if (this.categoriaForm.valid) {
      if (this.file == undefined && this.categoria.oferta === '1') {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Debe subir una img_oferta para registrar'
        });
        this.showNotificationError = true;
      } else {
        this.load_btn = true;
        this._categoriaService.registro_categoria_admin(this.categoria, this.file, this.token).subscribe(
          (response) => {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se registró correctamente el nuevo categoría.'
            });
            this.load_btn = false;
            this._router.navigate(['/panel/categorias']);
          },
          (error) => {
            this.load_btn = false;
            if (
              error.status === 404 &&
              error.error.message === 'El titulo ya esta registrado.'
            ) {
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-Danger',
                position: 'topRight',
                message: 'ya existe una categoria asociada a ese titulo en la base de datos',
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
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos'
      });
      this.load_btn = false;
    }
  }

  fileChangeEvent(event: any): void {
    var file: any;
    if (event.target.files && event.target.files[0]) {
      file = <File>event.target.files[0];
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'No hay una imagen de envío'
      });
    }

    if (file && file.size <= 4000000) {
      if (file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg') {
        const reader = new FileReader();
        reader.onload = e => this.imgSelect = reader.result;
        reader.readAsDataURL(file);
        $('#input-img_oferta').text(file.name);
        this.file = file;
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'El archivo debe ser una imagen'
        });
        $('#input-img_oferta').text('Seleccionar imagen');
        this.imgSelect = 'assets/img/01.jpg';
        this.file = undefined;
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'La imagen no puede superar los 4MB'
      });
      $('#input-img_oferta').text('Seleccionar imagen');
      this.imgSelect = 'assets/img/01.jpg';
      this.file = undefined;
    }

  }
}
