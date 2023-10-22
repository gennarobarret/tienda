import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { AdminService } from "src/app/services/admin.service";
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { CategoriaService } from "src/app/services/categoria.service";

declare let iziToast: any;
declare let $: any;

interface Ecategoria {
  titulo: string;
  icono: string;
  estado: boolean;
  oferta: boolean;
  descuento_oferta: number;
  fin_oferta: Date;
  portada: string;
}

@Component({
  selector: 'app-edit-categoria',
  templateUrl: './edit-categoria.component.html',
  styleUrls: ['./edit-categoria.component.css']
})
export class EditCategoriaComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;


  categoriaForm!: FormGroup;
  categoria: Ecategoria = {
    titulo: '',
    icono: '',
    estado: true,
    oferta: true,
    descuento_oferta: NaN,
    fin_oferta: new Date(),
    portada: ''
  };
  config: { height: number };
  token: any;
  load_btn = false;
  imageUrl = 'assets/img/default.jpg';
  sanitizedSvgContent: SafeHtml | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private _adminService: AdminService,
    private sanitizer: DomSanitizer,
    private _categoriaService: CategoriaService,
    private _router: Router,
    private _route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.config = {
      height: 500,
    };
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToFormChanges();
  }

  initializeForm() {
    this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
      response => {
        this.load_data = false;
        if (response.data == undefined) {
          this.categoria = undefined;
        } else {
          this.categoria = response.data;
          this.validateSvgCode();
          this.imgSelect = this.url + 'obtener_portada_categoria/' + this.categoria.portada;
          this.setLabelSelectImagen();
          this.showErrorEmply = this.categoria.portada === 'undefined';
          this.ofertaInactive();
        }
      },
      error => {
        console.log(error);
        // this._router.navigate(['/panel/categorias']);
      }
    );
  }


  subscribeToFormChanges(): void {
    this.categoriaForm.get('icono')?.valueChanges.subscribe((icono: string) => {
      this.sanitizedSvgContent = this.categoriaForm.get('icono')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono) : '';
    });

    const ofertaControl = this.categoriaForm.get('oferta');
    const descuentoOfertaControl = this.categoriaForm.get('descuento_oferta');
    const fechaOfertaControl = this.categoriaForm.get('fin_oferta');
    const portadaControl = this.categoriaForm.get('portada');

    if (ofertaControl && descuentoOfertaControl && fechaOfertaControl && portadaControl) {
      ofertaControl.valueChanges.subscribe((ofertaValue) => {
        if (ofertaValue === false) {
          this.imageUrl = 'assets/img/default.jpg';
          this.selectedFile = null;
          [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => control.disable({ onlySelf: true }));
        } else {
          [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => control.enable({ onlySelf: true }));
        }
      });
    }

    this.categoriaForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
      if (!estadoValue) {
        this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
      }
    });
  }

  get titulo() {
    return this.categoriaForm.get("titulo")!;
  }

  get icono() {
    return this.categoriaForm.get("icono")!;
  }

  get estado() {
    return this.categoriaForm.get("estado")!;
  }

  get oferta() {
    return this.categoriaForm.get("oferta")!;
  }

  get descuento_oferta() {
    return this.categoriaForm.get("descuento_oferta")!;
  }

  get fin_oferta() {
    return this.categoriaForm.get("fin_oferta")!;
  }

  get portada() {
    return this.categoriaForm.get("portada")!;
  }



  // public categoria: any = {};
  public id = '';
  public imgSelect: any | ArrayBuffer = 'assets/img/default.jpg';
  public labelSelectImagen: string = 'Seleccionar imagen';
  public showViewer: boolean = false;
  public showInvalidSvg: boolean = false;
  public sanitizedSvgCode: SafeHtml = '';
  public ofertaValue: string | undefined = '';
  public load_data = false;
  // public load_btn = false;
  // public token = localStorage.getItem('token');
  public url = GLOBAL.url;
  public formSubmitted = false;
  public file: File | undefined;
  public isOfertaInactive: boolean = false;
  public showErrorZero: boolean = false;
  public showErrorEmply: boolean = false;

  // constructor(
  //   private _adminService: AdminService,
  //   private _categoriaService: CategoriaService,
  //   private _router: Router,
  //   private sanitizer: DomSanitizer,
  //   private _route: ActivatedRoute,
  // ) {
  //   this.token = this._adminService.getToken();
  // }

  // ngOnInit() {
  //   this._route.params.subscribe(params => {
  //     this.id = params['id'];
  //     this.getCategoriaData();
  //   });
  // }

  // getCategoriaData() {
  //   this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
  //     response => {
  //       this.load_data = false;
  //       if (response.data == undefined) {
  //         this.categoria = undefined;
  //       } else {
  //         this.categoria = response.data;
  //         this.validateSvgCode();
  //         this.imgSelect = this.url + 'obtener_portada_categoria/' + this.categoria.portada;
  //         this.setLabelSelectImagen();
  //         this.showErrorEmply = this.categoria.portada === 'undefined';
  //         this.ofertaInactive();
  //       }
  //     },
  //     error => {
  //       console.log(error);
  //       // this._router.navigate(['/panel/categorias']);
  //     }
  //   );
  // }

  formatDate(dateString: string | undefined): string {
    const defaultDate = new Date(1, 0, 0, 0, 0, 0);
    const dateToFormat = dateString ? new Date(dateString) : defaultDate;
    const formattedDate = dateToFormat.toISOString().slice(0, 19).replace('T', ' '); // Formato yyyy-MM-dd HH:mm:ss
    return formattedDate;
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
      if (this.categoria.descuento_oferta === '') {
        this.categoria.descuento_oferta = 0;
        this.categoria.fin_oferta = '0000-00-00';
      }
      if (this.categoria.portada === 'undefined' || this.categoria.portada === undefined) {
        this.showErrorEmply = false;
      }
    } else {
      if (this.categoria.portada === 'undefined' || this.categoria.portada === undefined) {
        this.showErrorEmply = true;
      }
      if (this.categoria.descuento_oferta === 0) {
        this.categoria.descuento_oferta = '';
        this.categoria.fin_oferta = '';
      }
    }
  }

  fileChangeEvent(event: any): void {


    // const file = event.target.files && event.target.files[0];

    // if (!file) {
    //   this.showFileErrorMessage('No hay una imagen para enviar');
    //   return;
    // } else {
    //   this.showErrorEmply = false;
    // }

    // if (file.size > 4000000) {
    //   this.showFileErrorMessage('La imagen no puede superar los 4MB');
    //   return;
    // }

    // if (!['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'].includes(file.type)) {
    //   this.showFileErrorMessage('El archivo debe ser una imagen');
    //   return;
    // }

    // const reader = new FileReader();
    // reader.onload = () => this.imgSelect = reader.result;
    // reader.readAsDataURL(file);

    // $('#input-portada').text(file.name);
    // this.labelSelectImagen = file.name;

    // this.file = file;
  }

  actualizar() {
    // this.formSubmitted = true;

    // if (this.updateForm.valid) {
    //   if (!this.showErrorEmply && !this.showErrorZero) {
    //     const currentDate = new Date();
    //     const finOfertaDate = new Date(this.categoria.fin_oferta);

    //     if (finOfertaDate < currentDate) {
    //       this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
    //       this.load_btn = false;
    //       return; // Termina la ejecución si la validación falla
    //     }

    //     const data: any = {};
    //     if (this.file) {
    //       data.portada = this.file;
    //       this.showErrorEmply = false;
    //     }
    //     data.titulo = this.categoria.titulo;
    //     data.icono = this.categoria.icono;
    //     data.estado = this.categoria.estado;
    //     data.oferta = this.categoria.oferta;
    //     data.descuento_oferta = this.categoria.descuento_oferta;
    //     data.fin_oferta = this.categoria.fin_oferta;

    //     this.load_btn = true;
    //     this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
    //       response => {
    //         this.showSuccessMessage('Se actualizó correctamente el nuevo categoria.');
    //         this.load_btn = false;
    //         this._router.navigate(['/panel/categorias']);
    //       },
    //       error => {
    //         if (error.status === 404 && error.error.message === 'Ya existe una categoría con el mismo título.') {
    //           this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
    //         } else {
    //           this.showErrorMessage('Ocurrió un error en la actualización');
    //         }
    //         this.load_btn = false;
    //       }
    //     );
    //   } else {
    //     this.showFileErrorMessage('No hay una imagen para enviar');
    //     return;
    //   }
    // } else {
    //   this.showErrorMessage('Los datos del formulario no son válidos');
    // }
  }


  showSuccessMessage(message: string) {
    iziToast.success({
      title: "SUCCESS",
      titleColor: "#1DC74C",
      color: "#FFF",
      class: "text-success",
      position: "topRight",
      message: message,
    });
  }

  showWarningMessage(message: string) {
    iziToast.warning({
      title: "CAUTION",
      position: "topRight",
      message: message,
    });
  }

  showErrorMessage(message: string) {
    iziToast.error({
      title: "ERROR",
      position: "topRight",
      message: message,
    });
  }


  resetForm(): void {
    // Reset the 'portada' form control to null or an empty value
    this.categoriaForm.patchValue({
      titulo: null,
      icono: null,
      estado: true,
      oferta: true,
      fin_oferta: null,
      descuento_oferta: null,
      portada: null, // or '' depending on what you want
    });
    // Optionally, you can also reset the 'imageUrl' to the default image
    // this.imageUrl = 'assets/img/default.jpg';
  }

}

