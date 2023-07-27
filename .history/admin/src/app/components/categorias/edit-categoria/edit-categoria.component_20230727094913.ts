import { Component, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from 'src/app/services/categoria.service';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GLOBAL } from 'src/app/services/GLOBAL';

declare let iziToast: any;
declare let jQuery: any;
declare let $: any;

@Component({
  selector: 'app-edit-categoria',
  templateUrl: './edit-categoria.component.html',
  styleUrls: ['./edit-categoria.component.css']
})
export class EditCategoriaComponent {
  @ViewChild('updateForm', { static: false }) updateForm!: NgForm;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  public id = '';
  public config: any = {};
  public load_btn = false;
  public config_global: any = {};
  public formSubmitted = false;
  public categoria: any = { estado: '', oferta: '' };
  public isOfertaInactive = false;
  public load_data = false;
  public url = GLOBAL.url;
  public token = localStorage.getItem('token');
  public file: any = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public labelSelectImagen: string = 'Seleccionar imagen';
  public showViewer: boolean = false;
  public showInvalidSvg: boolean = false;
  public sanitizedSvgCode: SafeHtml = '';
  public showNotificationError: boolean = false;

  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
  ) {
    this.config = {
      height: 500
    }
    this.token = this._adminService.getToken();
  }

  ngOnInit() {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
        response => {
          if (response.data == undefined) {
            this.load_data = false;
            this.categoria = undefined;
          } else {
            this.load_data = false;
            this.categoria = response.data;
            this.imgSelect = this.url + 'obtener_portada_categoria/' + this.categoria.portada;
            this.isOfertaInactive = this.categoria.oferta === 0;
            this.validateSvgCode();
          }
        },
        error => {
          console.log(error);
        }
      );
    })
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

  ofertaInactive() {
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
        reader.readAsDataURL(file);
        $('#input-portada').text(file.name);
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
        $('#input-portada').text('Seleccionar imagen');
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
      $('#input-portada').text('Seleccionar imagen');
      this.imgSelect = 'assets/img/01.jpg';
      this.file = undefined;
    }


  }

  actualizar() {
    this.formSubmitted = true;

    if (this.updateForm.valid) {


      var data: any = {};

      if (this.file != undefined) {
        data.portada = this.file;
        console.log(data.portada);
      }

      data.titulo = this.categoria.titulo;
      data.icono = this.categoria.icono;
      data.estado = this.categoria.estado;
      data.oferta = this.categoria.oferta;
      data.descuento_oferta = this.categoria.descuento_oferta;
      data.fin_oferta = this.categoria.fin_oferta;

      this.load_btn = true;

      this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se actualizó correctamente el nuevo categoria.'
          });

          this.load_btn = false;

          this._router.navigate(['/panel/categorias']);
        },
        error => {
          this.load_btn = false;
        }
      )

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
    }
  }

  resetForm() {
    this.updateForm.resetForm();
    this.categoria = {
      estado: '',
      oferta: '',
    };
    this.updateForm.form.get('estado')?.setValue('', { onlySelf: true });
    this.updateForm.form.get('oferta')?.setValue('', { onlySelf: true });
    this.imgSelect = 'assets/img/01.jpg';
    this.file = undefined;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.labelSelectImagen = 'Seleccionar imagen';
    this.showViewer = false;
    this.showInvalidSvg = false;
    this.showNotificationError = false;
  }

}