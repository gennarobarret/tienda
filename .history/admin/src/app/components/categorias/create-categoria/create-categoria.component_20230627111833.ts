import { Component, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { CategoriaService } from 'src/app/services/categoria.service';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


declare var iziToast: any;
declare var jQuery: any;
declare var $: any;


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
  public categoria: any = { estado: '', oferta: '' };

  showViewer: boolean = false;
  showInvalidSvg: boolean = false;
  sanitizedSvgCode: SafeHtml = '';

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
    }
  }


  registro() {
    this.formSubmitted = true;
    if (this.categoriaForm.valid) {
      if (this.file == undefined && this.categoria.oferta === 0) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Debe subir una img_oferta para registrar'
        });
      } else {
        console.log(this.categoria);
        console.log(this.file);
        this.load_btn = true;
        this._categoriaService.registro_categoria_admin(this.categoria, this.file, this.token).subscribe(
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

    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son validos'
      });
      this.load_btn = false;

      $('#input-img_oferta').text('Seleccionar imagen');
      this.imgSelect = 'assets/img/01.jpg';
      this.file = undefined;
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
        message: 'No hay un imagen de envio'
      });
    }

    if (file.size <= 4000000) {

      if (file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg') {

        const reader = new FileReader();
        reader.onload = e => this.imgSelect = reader.result;
        // console.log(this.imgSelect);


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

    console.log(this.file);

  }


}
