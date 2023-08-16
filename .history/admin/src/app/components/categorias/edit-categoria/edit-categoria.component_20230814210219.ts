import { Component, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from 'src/app/services/categoria.service';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  public categoria: any = { estado: '', oferta: '', fin_oferta: '0000-00-00' };
  public id = '';
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public labelSelectImagen: string = 'Seleccionar imagen';
  public showViewer: boolean = false;
  public showInvalidSvg: boolean = false;
  public sanitizedSvgCode: SafeHtml = '';
  public ofertaValue: string | undefined = '';
  public load_data = false;
  public load_btn = false;
  public token = localStorage.getItem('token');
  public url = GLOBAL.url;
  public formSubmitted = false;
  public file: File | undefined;
  public isOfertaInactive: boolean = false;
  public showErrorZero: boolean = false;
  public showErrorEmply: boolean = false;

  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit() {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this.ofertaInactive();
      this.getCategoriaData();
    });
  }

  getCategoriaData() {
    this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
      response => {
        this.load_data = false;
        if (response.data == undefined) {
          this.categoria = undefined;
        } else {
          this.categoria = response.data;
          console.log(this.categoria);
          this.validateSvgCode();
          this.categoria.fin_oferta = this.getValidDate(this.categoria.fin_oferta);
          this.imgSelect = this.url + 'obtener_portada_categoria/' + this.categoria.portada;
          this.setLabelSelectImagen();
          this.showErrorEmply = this.categoria.portada === 'undefined';
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };
    return date.toLocaleString('es-ES', options);
  }

  getValidDate(dateStr: any): string {
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    return isValidDate ? dateStr : '0000-00-00';
  }

  setLabelSelectImagen() {
    if (this.categoria && this.categoria['portada']) {
      this.labelSelectImagen = this.getFileNameFromPath(this.categoria['portada']);
      if (this.labelSelectImagen === 'undefined') {
        this.labelSelectImagen = 'Seleccionar imagen';
      }
    }
  }

  getFileNameFromPath(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  validateSvgCode() {
    const svgCode = this.categoria.icono;

    if (!svgCode || typeof svgCode !== 'string' || svgCode.trim() === '') {
      this.showViewer = false;
      this.showInvalidSvg = false;
      this.sanitizedSvgCode = '';
      this.updateForm.controls['icono'].markAsTouched();
      return;
    }

    const svgRegex = /^<svg[\s\S]*<\/svg>$/i;
    const isValidSvg = svgRegex.test(svgCode);
    const hasXmlnsAttribute = svgCode.includes('xmlns="http://www.w3.org/2000/svg"');

    if (isValidSvg && hasXmlnsAttribute) {
      this.showViewer = true;
      this.showInvalidSvg = false;
      this.sanitizedSvgCode = this.sanitizer.bypassSecurityTrustHtml(svgCode);
    } else {
      this.showViewer = false;
      this.showInvalidSvg = !(isValidSvg && hasXmlnsAttribute);
      this.sanitizedSvgCode = '';
    }
  }

  applyDiscountRange() {
    if (this.categoria.descuento_oferta > 100) {
      this.categoria.descuento_oferta = 100;
    } else if (this.categoria.descuento_oferta < 0) {
      this.categoria.descuento_oferta = 0;
    }
    this.showErrorZero = this.categoria.descuento_oferta === '0';
  }

  restrictInput(event: any) {
    const inputValue = event.target.value;
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
    if (inputValue === '0' || inputValue === '00' || inputValue === '000') {
      event.preventDefault();
    }
  }

  limitInputLength(event: any) {
    const inputValue = event.target.value;
    if (inputValue.length > 3) {
      event.target.value = inputValue.slice(0, 3);
    }
  }

  ofertaInactive() {
    this.isOfertaInactive = this.categoria.oferta == 0 || this.categoria.oferta === '';
    if (this.isOfertaInactive) {
      if (this.categoria.descuento_oferta === '0') {
        this.showErrorZero = false;
      }
      if (this.categoria.portada === 'undefined') {
        this.showErrorEmply = false;
      }
      this.categoria.descuento_oferta = '';
      this.categoria.fin_oferta = '';
    } else {
      this.categoria.descuento_oferta = '';
      this.categoria.fin_oferta = '';
    }
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files && event.target.files[0];


    if (!file) {
      this.showErrorEmply = true;
      // this.showFileErrorMessage('No hay una imagen para enviar');
      return;
    } else {

    }

    if (file.size > 4000000) {
      this.showFileErrorMessage('La imagen no puede superar los 4MB');
      return;
    }

    if (!['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'].includes(file.type)) {
      this.showFileErrorMessage('El archivo debe ser una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.imgSelect = reader.result;
    reader.readAsDataURL(file);

    $('#input-portada').text(file.name);
    this.labelSelectImagen = file.name;

    this.file = file;
  }


  showFileErrorMessage(message: string) {
    iziToast.show({
      title: 'ERROR',
      titleColor: '#FF0000',
      color: '#FFF',
      class: 'text-danger',
      position: 'topRight',
      message: message,
    });
    $('#input-portada').text('Seleccionar imagen');
    this.imgSelect = 'assets/img/01.jpg';
    this.file = undefined;
  }

  actualizar() {
    this.formSubmitted = true;
    if (this.updateForm.valid) {
      if (!this.showErrorEmply || !this.showErrorZero) {
        const data: any = {};
        if (this.file) {
          data.portada = this.file;
        }
        data.titulo = this.categoria.titulo;
        data.icono = this.categoria.icono;
        data.estado = this.categoria.estado;
        data.oferta = this.categoria.oferta;
        data.descuento_oferta = this.categoria.descuento_oferta;
        data.fin_oferta = this.categoria.fin_oferta;

        alert('SUCCESS!! :-)\n\n' + JSON.stringify(data, null, 4))

        // this.load_btn = true;
        // this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
        //   response => {
        //     this.showSuccessToast();
        //     this.load_btn = false;
        //     this._router.navigate(['/panel/categorias']);
        //   },
        //   error => {
        //     this.showErrorToast(error);
        //     this.load_btn = false;
        //   }
        // );
      } else {
        this.showFileErrorMessage('No hay una imagen para enviar');
        return;
      }
    } else {
      this.showFormValidationError();
    }
  }


  showSuccessToast() {
    iziToast.show({
      title: 'SUCCESS',
      titleColor: '#1DC74C',
      color: '#FFF',
      class: 'text-success',
      position: 'topRight',
      message: 'Se actualizó correctamente el nuevo categoria.',
    });
  }

  showErrorToast(error: any) {
    if (error.status === 404 && error.error.message === 'Ya existe una categoría con el mismo título.') {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-Danger',
        position: 'topRight',
        message: 'Ya existe una categoría asociada a ese título en la base de datos',
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

  showFormValidationError() {
    iziToast.show({
      title: 'ERROR',
      titleColor: '#FF0000',
      color: '#FFF',
      class: 'text-danger',
      position: 'topRight',
      message: 'Los datos del formulario no son válidos',
    });
  }

  resetForm() {
    this.updateForm.resetForm();
    this.categoria = { estado: '', oferta: '' };
    ['estado', 'oferta'].forEach(field => {
      this.updateForm.form.get(field)?.setValue('', { onlySelf: true });
    });

    this.imgSelect = 'assets/img/01.jpg';
    this.file = undefined;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.labelSelectImagen = 'Seleccionar imagen';
    this.showViewer = false;
    this.showInvalidSvg = false;
    this.showErrorZero = false;
  }

}

