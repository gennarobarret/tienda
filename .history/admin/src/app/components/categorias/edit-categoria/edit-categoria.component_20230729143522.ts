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

  public categoria: any = { estado: '', oferta: '', fin_oferta: '0000-00-00' };
  public id = '';
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public labelSelectImagen: string = 'Seleccionar imagen';
  public showViewer: boolean = false;
  public showInvalidSvg: boolean = false;
  public sanitizedSvgCode: SafeHtml = '';
  public isOfertaInactive = false;
  public ofertaValue: string | undefined = '';
  public load_data = false;
  public load_btn = false;
  public token = localStorage.getItem('token');
  public url = GLOBAL.url;
  public formSubmitted = false;
  public file: File | undefined;
  public showNotificationError: boolean = false;

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
          // console.log(this.categoria);
          this.isOfertaInactive = this.categoria.oferta === 0;
          console.log(this.isOfertaInactive);
          this.validateSvgCode();
          this.categoria.fin_oferta = this.getValidDate(this.categoria.fin_oferta);
          this.disableOfertaFieldsIfNeeded();
          this.imgSelect = this.url + 'obtener_portada_categoria/' + this.categoria.portada;
          this.setLabelSelectImagen();

        }
      },
      error => {
        console.log(error);
      }
    );
  }

  disableOfertaFieldsIfNeeded() {
    if (this.categoria.oferta === 0) {
      this.showNotificationError = false;
      this.categoria.oferta = '0';
      this.updateForm.form.get('descuento_oferta')?.disable({ onlySelf: true });
      this.updateForm.form.get('fin_oferta')?.disable({ onlySelf: true });
      this.updateForm.form.get('portada')?.disable({ onlySelf: true });
    }
  }

  getValidDate(dateStr: any): string {
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    return isValidDate ? dateStr : 'yyyy-MM-dd';
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
    this.showNotificationError = this.categoria.descuento_oferta === '0';
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

  ofertaInactive() {
    if (this.categoria.oferta === '0') {
      this.showNotificationError = false;
    }
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      this.showFileErrorMessage('No hay una imagen para enviar');
      return;
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
    console.log(this.updateForm.valid);

    if (this.updateForm.valid) {
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

      this.load_btn = true;
      this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
        response => {
          this.showSuccessToast();
          this.load_btn = false;
          this._router.navigate(['/panel/categorias']);
        },
        error => {
          this.showErrorToast(error);
          this.load_btn = false;
        }
      );
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
    this.showNotificationError = false;
  }

}




// import { Component, ViewChild, ElementRef } from '@angular/core';
// import { AdminService } from 'src/app/services/admin.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CategoriaService } from 'src/app/services/categoria.service';
// import { NgForm } from '@angular/forms';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { GLOBAL } from 'src/app/services/GLOBAL';

// declare let iziToast: any;
// declare let jQuery: any;
// declare let $: any;

// @Component({
//   selector: 'app-edit-categoria',
//   templateUrl: './edit-categoria.component.html',
//   styleUrls: ['./edit-categoria.component.css']
// })

// export class EditCategoriaComponent {

//   @ViewChild('updateForm', { static: false }) updateForm!: NgForm;
//   @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

//   public id = '';
//   public config: any = {};
//   public load_btn = false;
//   public config_global: any = {};
//   public load_data = false;
//   public url = GLOBAL.url;
//   public token = localStorage.getItem('token');
//   public formSubmitted = false;
//   public categoria: any = { estado: '', oferta: '', fin_oferta: '0000-00-00' };
//   public showViewer: boolean = false;
//   public showInvalidSvg: boolean = false;
//   public sanitizedSvgCode: SafeHtml = '';
//   public isOfertaInactive = false;
//   public file: any = undefined;
//   public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
//   public labelSelectImagen: string = 'Seleccionar imagen';
//   public showNotificationError: boolean = false;
//   public ofertaValue: string | undefined = '';


//   constructor(
//     private _adminService: AdminService,
//     private _categoriaService: CategoriaService,
//     private _router: Router,
//     private sanitizer: DomSanitizer,
//     private _route: ActivatedRoute,
//   ) {
//     this.config = {
//       height: 500
//     }
//     this.token = this._adminService.getToken();
//   }

//   ngOnInit() {
//     this._route.params.subscribe(params => {
//       this.id = params['id'];
//       this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
//         response => {
//           if (response.data == undefined) {
//             this.load_data = false;
//             this.categoria = undefined;
//           } else {
//             this.load_data = false;
//             this.categoria = response.data;
//             this.imgSelect = this.url + 'obtener_portada_categoria/' + this.categoria.portada;
//             this.isOfertaInactive = this.categoria.oferta === 0;
//             this.validateSvgCode();
//             if (this.categoria && this.categoria['portada']) {
//               this.labelSelectImagen = this.getFileNameFromPath(this.categoria['portada']);
//               if (this.labelSelectImagen === 'undefined') {
//                 this.labelSelectImagen = 'Seleccionar imagen';
//               }
//             }
//             if (this.categoria.oferta === 0) {
//               this.disableOfertaFields();
//             }
//           }
//         },
//         error => {
//           console.log(error);
//         }
//       );
//     });
//   }


//   disableOfertaFields() {
//     this.categoria.oferta = '0';
//     this.updateForm.form.get('descuento_oferta')?.disable({ onlySelf: true });
//     this.updateForm.form.get('fin_oferta')?.disable({ onlySelf: true });
//     this.updateForm.form.get('portada')?.disable({ onlySelf: true });
//     this.ofertaValue = this.categoria.oferta;
//   }


//   getFileNameFromPath(path: string): string {
//     const parts = path.split('/');
//     return parts[parts.length - 1];
//   }

//   validateSvgCode() {
//     const svgCode = this.categoria.icono;

//     if (svgCode === null || typeof svgCode !== 'string' || svgCode.trim() === '') {
//       this.showViewer = false;
//       this.showInvalidSvg = false;
//       this.sanitizedSvgCode = '';
//       this.updateForm.controls['icono'].markAsTouched();
//       return;
//     }
//     const svgRegex = /^<svg[\s\S]*<\/svg>$/i;
//     const isValidSvg = svgRegex.test(svgCode);
//     const hasXmlnsAttribute = svgCode.includes('xmlns="http://www.w3.org/2000/svg"');
//     if (isValidSvg && hasXmlnsAttribute) {
//       this.showViewer = true;
//       this.showInvalidSvg = false;
//       this.sanitizedSvgCode = this.sanitizer.bypassSecurityTrustHtml(svgCode);
//     } else {
//       this.showViewer = false;
//       this.showInvalidSvg = !(isValidSvg && hasXmlnsAttribute);
//       this.sanitizedSvgCode = '';
//     }
//   }


//   ofertaInactive() {
//     if (this.categoria.oferta === '0') {
//       this.showNotificationError = false;
//     }
//   }

//   applyDiscountRange() {
//     if (this.categoria.descuento_oferta > 100) {
//       this.categoria.descuento_oferta = 100;
//     } else if (this.categoria.descuento_oferta < 0) {
//       this.categoria.descuento_oferta = 0;
//     }
//     if (this.categoria.descuento_oferta !== '0') {
//       this.showNotificationError = false;
//     } else {
//       this.showNotificationError = true;
//     }
//   }

//   restrictInput(event: any) {
//     const charCode = event.charCode;
//     if (charCode < 48 || charCode > 57) {
//       event.preventDefault();
//     }
//   }

//   limitInputLength(event: any) {
//     const inputValue = event.target.value;
//     if (inputValue.length > 3) {
//       event.target.value = inputValue.slice(0, 3);
//     }
//   }

//   readOnly(): boolean {
//     return this.categoria.oferta === '0' || this.categoria.oferta === '';
//   }

//   fileChangeEvent(event: any): void {
//     var file: any;
//     if (event.target.files && event.target.files[0]) {
//       file = <File>event.target.files[0];
//       // this.categoria.portada = file.target.files[0].name;
//       // console.log(this.categoria.portada);
//     } else {
//       iziToast.show({
//         title: 'ERROR',
//         titleColor: '#FF0000',
//         color: '#FFF',
//         class: 'text-danger',
//         position: 'topRight',
//         message: 'No hay un imagen de envio'
//       });
//     }
//     if (file.size <= 4000000) {
//       if (file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg') {
//         const reader = new FileReader();
//         reader.onload = e => this.imgSelect = reader.result;
//         reader.readAsDataURL(file);
//         $('#input-portada').text(file.name);
//         console.log(file);
//         if (file) {
//           this.labelSelectImagen = file.name;
//         } else {
//           this.labelSelectImagen = 'Seleccionar imagen';
//         }
//         this.file = file;
//       } else {
//         iziToast.show({
//           title: 'ERROR',
//           titleColor: '#FF0000',
//           color: '#FFF',
//           class: 'text-danger',
//           position: 'topRight',
//           message: 'El archivo debe ser una imagen'
//         });
//         $('#input-portada').text('Seleccionar imagen');
//         this.imgSelect = 'assets/img/01.jpg';
//         this.file = undefined;
//       }
//     } else {
//       iziToast.show({
//         title: 'ERROR',
//         titleColor: '#FF0000',
//         color: '#FFF',
//         class: 'text-danger',
//         position: 'topRight',
//         message: 'La imagen no puede superar los 4MB'
//       });
//       $('#input-portada').text('Seleccionar imagen');
//       this.imgSelect = 'assets/img/01.jpg';
//       this.file = undefined;
//     }


//   }

//   actualizar() {
//     this.formSubmitted = true;
//     console.log(this.updateForm.valid);
//     // if (this.updateForm.valid) {
//     //   var data: any = {};
//     //   if (this.file != undefined) {
//     //     data.portada = this.file;
//     //   }
//     //   data.titulo = this.categoria.titulo;
//     //   data.icono = this.categoria.icono;
//     //   data.estado = this.categoria.estado;
//     //   data.oferta = this.categoria.oferta;
//     //   data.descuento_oferta = this.categoria.descuento_oferta;
//     //   data.fin_oferta = this.categoria.fin_oferta;
//     //   this.load_btn = true;
//     //   this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
//     //     response => {
//     //       iziToast.show({
//     //         title: 'SUCCESS',
//     //         titleColor: '#1DC74C',
//     //         color: '#FFF',
//     //         class: 'text-success',
//     //         position: 'topRight',
//     //         message: 'Se actualizó correctamente el nuevo categoria.'
//     //       });
//     //       this.load_btn = false;
//     //       this._router.navigate(['/panel/categorias']);
//     //     },
//     //     (error) => {
//     //       this.load_btn = false;
//     //       if (
//     //         error.status === 404 &&
//     //         error.error.message === 'Ya existe una categoría con el mismo título.'
//     //       ) {
//     //         iziToast.show({
//     //           title: 'ERROR',
//     //           titleColor: '#FF0000',
//     //           color: '#FFF',
//     //           class: 'text-Danger',
//     //           position: 'topRight',
//     //           message: 'ya existe una categoria asociada a ese titulo en la base de datos',
//     //         });
//     //       } else {
//     //         iziToast.show({
//     //           title: 'ERROR',
//     //           titleColor: '#FF0000',
//     //           color: '#FFF',
//     //           class: 'text-Danger',
//     //           position: 'topRight',
//     //           message: 'Ocurrió un error en el registro',
//     //         });
//     //       }
//     //     }
//     //   );

//     // } else {
//     //   iziToast.show({
//     //     title: 'ERROR',
//     //     titleColor: '#FF0000',
//     //     color: '#FFF',
//     //     class: 'text-danger',
//     //     position: 'topRight',
//     //     message: 'Los datos del formulario no son validos'
//     //   });
//     //   this.load_btn = false;
//     // }
//   }

//   resetForm() {
//     this.updateForm.resetForm();
//     this.categoria = {
//       estado: '',
//       oferta: '',
//     };
//     this.updateForm.form.get('estado')?.setValue('', { onlySelf: true });
//     this.updateForm.form.get('oferta')?.setValue('', { onlySelf: true });
//     this.imgSelect = 'assets/img/01.jpg';
//     this.file = undefined;
//     if (this.fileInput) {
//       this.fileInput.nativeElement.value = '';
//     }
//     this.labelSelectImagen = 'Seleccionar imagen';
//     this.showViewer = false;
//     this.showInvalidSvg = false;
//     this.showNotificationError = false;
//   }

// }