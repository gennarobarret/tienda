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
@Component({
  selector: 'app-edit-categoria',
  templateUrl: './edit-categoria.component.html',
  styleUrls: ['./edit-categoria.component.css']
})
export class EditCategoriaComponent {

  updateForm!: FormGroup;
  id = '';
  load_data = false;
  config: { height: number };
  token = localStorage.getItem('token');
  load_btn = false;
  imageUrl: any | ArrayBuffer = 'assets/img/default.jpg';
  sanitizedSvgContent: SafeHtml | null = null;
  selectedFile: File | null = null;
  url = GLOBAL.url;

  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.config = {
      height: 500,
    };
    this.token = this._adminService.getToken();
    this.updateForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      icono: ['', [Validators.required, svgValidator()]],
      estado: ['', [Validators.required]],
      oferta: ['', [Validators.required]],
      descuento_oferta: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      fin_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada: ['', [Validators.required]],
      createdAt: [''],
      updatedAt: [''],
    });

  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this.initializeForm();
    });
    this.subscribeToFormChanges();
  }

  initializeForm() {
    this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
      response => {
        this.load_data = false;
        if (response.data === undefined) {
          this._router.navigate(['/panel/categorias']);
        } else {
          const { titulo, icono, estado, oferta, descuento_oferta, fin_oferta, portada, createdAt, updatedAt } = response.data;
          // console.log(response.data)
          // Convert the date format before assigning it to the form control
          const formattedFinOferta = this.convertDateFormat(fin_oferta);
          this.imageUrl = this.url + 'obtener_portada_categoria/' + portada;
          this.updateForm.patchValue({
            titulo: titulo,
            icono: icono,
            estado: estado,
            oferta: oferta,
            descuento_oferta: descuento_oferta,
            fin_oferta: formattedFinOferta,
            // portada: portada,
            createdAt: createdAt,
            updatedAt: updatedAt
          });

        }
      },
      error => {
        console.log(error);
        this._router.navigate(['/panel/categorias']);
      }
    );
  }

  convertDateFormat(originalDateString: string): string {
    const originalDate = new Date(originalDateString);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  subscribeToFormChanges(): void {
    this.updateForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
      if (!estadoValue) {
        this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
      }
    });
    this.updateForm.get('icono')?.valueChanges.subscribe((icono: string) => {
      this.sanitizedSvgContent = this.updateForm.get('icono')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono) : '';
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
          [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
            control.disable({ onlySelf: true });
          });
        } else {
          [fechaOfertaControl, portadaControl].forEach(control => {
            control.enable({ onlySelf: true });
          });

          // Check if descuento_oferta is 0 and set it to null
          if (descuentoOfertaControl.value === 0) {
            descuentoOfertaControl.setValue(null);
          } else {
            descuentoOfertaControl.enable({ onlySelf: true });
          }
        }
      });
    }
  }


  // subscribeToFormChanges(): void {

  //   this.updateForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
  //     if (!estadoValue) {
  //       this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
  //     }
  //   });
  //   this.updateForm.get('icono')?.valueChanges.subscribe((icono: string) => {
  //     this.sanitizedSvgContent = this.updateForm.get('icono')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono) : '';
  //   });

  //   const ofertaControl = this.updateForm.get('oferta');
  //   const descuentoOfertaControl = this.updateForm.get('descuento_oferta');
  //   const fechaOfertaControl = this.updateForm.get('fin_oferta');
  //   const portadaControl = this.updateForm.get('portada');

  //   if (ofertaControl && descuentoOfertaControl && fechaOfertaControl && portadaControl) {
  //     ofertaControl.valueChanges.subscribe((ofertaValue) => {
  //       if (ofertaValue === false) {
  //         // this.imageUrl = 'assets/img/default.jpg';
  //         // this.selectedFile = null;
  //         // Disable the controls
  //         [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach((control) =>
  //           control.disable({ onlySelf: true })
  //         );
  //         // descuentoOfertaControl.setValue(0);
  //         // const defaulDate = new Date('0000-01-01T00:00:00.000Z');
  //         // const formattedEndOfferDate = this.convertDateFormat(defaulDate);
  //         // fechaOfertaControl.setValue(formattedEndOfferDate);
  //       } else {
  //         // Enable the controls
  //         [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach((control) =>
  //           control.enable({ onlySelf: true })
  //         );
  //         // descuentoOfertaControl.setValue(null);
  //         // fechaOfertaControl.setValue(null);
  //       }
  //     });
  //   }

  // }

  get titulo() {
    return this.updateForm.get("titulo")!;
  }

  get icono() {
    return this.updateForm.get("icono")!;
  }

  get estado() {
    return this.updateForm.get("estado")!;
  }

  get oferta() {
    return this.updateForm.get("oferta")!;
  }

  get descuento_oferta() {
    return this.updateForm.get("descuento_oferta")!;
  }

  get fin_oferta() {
    return this.updateForm.get("fin_oferta")!;
  }

  get portada() {
    return this.updateForm.get("portada")!;
  }

  limitInputLength(event: any) {
    const inputValue = event.target.value;

    if (inputValue.length > 3) {
      event.target.value = inputValue.slice(0, 3);
    }

    // Realiza una verificación de nulidad antes de acceder a numberInput
    const numberInput = this.updateForm.get("descuento_oferta");
    if (numberInput !== null && numberInput.value < 0) {
      numberInput.setValue(0);
    }
    if (numberInput !== null && numberInput.value > 100) {
      numberInput.setValue(100);
    }
  }

  restrictInput(event: any) {
    const charCode = event.charCode;
    const inputValue = (event.target as HTMLInputElement).value;
    const currentValue = parseInt(inputValue, 10); // Convierte el valor a un número entero

    // Verifica si el nuevo valor sería menor que 0 o mayor que 100
    if (charCode === 45 && currentValue === 0) {
      // Evita la entrada de "-" cuando el valor es 0
      event.preventDefault();
      return;
    } else if (currentValue === -1 || (currentValue === 100 && charCode !== 46)) {
      // Evita la entrada de "-1" o "100" (excepto el punto decimal para 100.0)
      event.preventDefault();
      return;
    }

    if (charCode < 48 || charCode > 57) {
      // Evita la entrada de caracteres no numéricos
      event.preventDefault();
      return;
    }
  }

  private validateDiscountRange(control: FormControl): { [key: string]: any } | null {
    const descuentoControl = control.value;
    if (descuentoControl == null) {
      return null//Or return an appropriate validation result if needed
    }
    if (descuentoControl === 0) {
      this.showErrorMessage('El descuento de la oferta de la categoria no puede ser cero');
      return { 'invalidDiscount': true };
    }
    return null;
  }


  private validateOfertDate(control: FormControl): { [key: string]: any } | null {
    const inputDateStr: string = control.value;
    const currentDate = new Date();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(inputDateStr)) {
      return { 'invalidDate': true };
    }

    const finOfertaDateControl: Date = new Date(inputDateStr);

    if (isNaN(finOfertaDateControl.getTime())) {
      this.showErrorMessage('La fecha introducida no es válida.');
      return { 'invalidDate': true };
    }

    if (finOfertaDateControl <= currentDate) {
      this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
      return { 'invalidDate': true };
    }

    return null;
  }

  fileChangeEvent(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];
      this.validateAndUpdatePortada(this.selectedFile);
    }
  }

  private validateAndUpdatePortada(file: File) {
    const errors = this.validateFileUpdate(file);
    if (errors) {
      this.updateForm.get('portada')!.setErrors(errors);
    }
  }

  private validateFileUpdate(file: File): { [key: string]: any } | null {
    if (file) {
      const validTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];
      if (validTypes.includes(file.type)) {
        if (file.size <= 4000000) {
          let reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = () => {
            if (reader.result !== null) {
              this.imageUrl = reader.result as string;
              this.updateForm.patchValue({
                file: reader.result
              });
            }
          }

          this.cd.markForCheck();
          return null;
        } else {
          // console.log('La imagen no puede superar los 4MB');
          this.showErrorMessage('La imagen no puede superar los 4MB');
          return { invalidFileSize: true };
        }
      } else {
        // console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
        this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
        return { invalidFileType: true };
      }
    }

    return null;
  }

  actualizar() {
    if (this.updateForm.invalid) {
      for (const control of Object.keys(this.updateForm.controls)) {
        this.updateForm.controls[control].markAsTouched();
      }
      this.load_btn = false;
      this.showErrorMessage("Hay errores en el formulario. Por favor, verifica los campos.");
      return;
    }
    const formValue = this.updateForm.value;
    console.info('titulo:', formValue.titulo);
    console.info('icono:', formValue.icono);
    console.info('estado:', formValue.estado);
    console.info('oferta:', formValue.oferta);
    console.info('descuento_oferta:', formValue.descuento_oferta);
    console.info('fin_oferta:', formValue.fin_oferta);
    console.info('portada:', formValue.portada);
    console.info('file:', this.selectedFile);


    const data: any = {};

    data.titulo = formValue.titulo;
    data.icono = formValue.icono;
    data.estado = formValue.estado;
    data.oferta = formValue.oferta;
    data.descuento_oferta = formValue.descuento_oferta;
    data.fin_oferta = formValue.fin_oferta;

    this.load_btn = true;
    this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se actualizó correctamente el nuevo categoria.');
        this.load_btn = false;
        this._router.navigate(['/panel/categorias']);
      },
      error => {
        if (error.status === 404 && error.error.message === 'Ya existe una categoría con el mismo título.') {
          this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
        } else {
          this.showErrorMessage('Ocurrió un error en la actualización');
        }
        this.load_btn = false;
      }
    );

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
    this.updateForm.patchValue({
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

