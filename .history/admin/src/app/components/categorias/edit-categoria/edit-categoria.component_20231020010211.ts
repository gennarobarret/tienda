import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { AdminService } from "src/app/services/admin.service";
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { CategoriaService } from "src/app/services/categoria.service";
import { OfertaService } from 'src/app/services/oferta.service';

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
  filtro = '';
  ofertas: any[] = [];
  load_data = false;
  config: { height: number };
  token = localStorage.getItem('token');
  load_btn = false;
  sanitizedSvgContent: SafeHtml | null = null;
  url = GLOBAL.url;

  dropdownSettings = {
    singleSelection: false,
    idField: '_id',
    textField: 'nombre_oferta',
    selectAllText: 'Seleccionar todo',
    unSelectAllText: 'Anular la selección de todo',
    itemsShowLimit: 4, // Number of items to display in the dropdown before truncating
    allowSearchFilter: false, // Enable search functionality
  };

  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _ofertaService: OfertaService,
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
      nombre_categoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      icono_categoria: ['', [Validators.required, svgValidator()]],
      estado_categoria: ['', [Validators.required]],
      ofertas_categoria: ['', []],
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
          const { nombre_categoria, icono_categoria, estado_categoria, ofertas_categoria, createdAt, updatedAt } = response.data;
          console.log(response.data)
          this.updateForm.patchValue({
            nombre_categoria: nombre_categoria,
            icono_categoria: icono_categoria,
            estado_categoria: estado_categoria,
            ofertas_categoria: ofertas_categoria,
            createdAt: createdAt,
            updatedAt: updatedAt
          });
          this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
            response => {
              this.ofertas = response.data;
              const { nombre_oferta, estado_categoria_oferta, descripcion_oferta, descuento_oferta, inicio_oferta, fin_oferta, portada_oferta, createdAt, updatedAt } = response.data;
              const formatteInicioOferta = this.convertDateFormat(inicio_oferta);
              const formattedFinOferta = this.convertDateFormat(fin_oferta);
              // this.imageUrl = this.url + 'obtener_portada_oferta/' + portada_oferta;
              this.updateForm.patchValue({
                oferta: nombre_oferta,
                // estado_categoria_oferta: estado_categoria_oferta,
                // descripcion_oferta: descripcion_oferta,
                // descuento_oferta: descuento_oferta,
                // inicio_oferta: formatteInicioOferta,
                // fin_oferta: formattedFinOferta,
                // createdAt: createdAt,
                // updatedAt: updatedAt
              });
              this.load_data = false;
            },
            error => {
              console.log(error);
            }
          );
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

  onOfertaSeleccionada(event: Event): void {
    const idOfertaSeleccionado = (event.target as HTMLSelectElement).value;
    // console.log(`ID de la oferta seleccionada: ${idOfertaSeleccionado}`);
    // Establecer el valor en el formulario
    this.updateForm.patchValue({ oferta: idOfertaSeleccionado });
  }





  subscribeToFormChanges(): void {
    this.updateForm.get("estado_categoria")!.valueChanges.subscribe((estado_categoriaValue) => {
      if (!estado_categoriaValue) {
        this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
      }
    });
    this.updateForm.get('icono_categoria')?.valueChanges.subscribe((icono_categoria: string) => {
      this.sanitizedSvgContent = this.updateForm.get('icono_categoria')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono_categoria) : '';
    });

    const estado_categoriaControl = this.updateForm.get('estado_categoria');
    // const nombre_categoriaControl = this.updateForm.get('nombre_categoria');
    const icono_categoriaControl = this.updateForm.get('icono_categoria');

    if (estado_categoriaControl && icono_categoriaControl) {
      estado_categoriaControl.valueChanges.subscribe((ofertaValue) => {
        if (ofertaValue === false) {

          [icono_categoriaControl].forEach(control => {
            control.disable({ onlySelf: true });
          });
        } else {
          // Check if descuento_oferta is 0 and set it to null
          [icono_categoriaControl].forEach(control => {
            control.enable({ onlySelf: true });
          });

        }
      });
    }

    // const ofertaControl = this.updateForm.get('oferta');
    // const descuentoOfertaControl = this.updateForm.get('descuento_oferta');
    // const fechaOfertaControl = this.updateForm.get('fin_oferta');
    // const portadaControl = this.updateForm.get('portada');

    // if (ofertaControl && descuentoOfertaControl && fechaOfertaControl && portadaControl) {
    //   ofertaControl.valueChanges.subscribe((ofertaValue) => {
    //     if (ofertaValue === false) {

    //       [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
    //         control.disable({ onlySelf: true });
    //       });
    //     } else {
    //       // Check if descuento_oferta is 0 and set it to null
    //       if (descuentoOfertaControl.value === 0) {
    //         descuentoOfertaControl.setValue(null);
    //       }
    //       if (fechaOfertaControl.value === '2000-01-01') {
    //         fechaOfertaControl.setValue(null);
    //       }
    //       [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
    //         control.enable({ onlySelf: true });
    //       });

    //     }
    //   });
    // }
  }

  get nombre_categoria() {
    return this.updateForm.get("nombre_categoria")!;
  }

  get icono_categoria() {
    return this.updateForm.get("icono_categoria")!;
  }

  get estado_categoria() {
    return this.updateForm.get("estado_categoria")!;
  }

  // get oferta() {
  //   return this.updateForm.get("oferta")!;
  // }

  // get descuento_oferta() {
  //   return this.updateForm.get("descuento_oferta")!;
  // }

  // get fin_oferta() {
  //   return this.updateForm.get("fin_oferta")!;
  // }

  // get portada() {
  //   return this.updateForm.get("portada")!;
  // }

  // limitInputLength(event: any) {
  //   const inputValue = event.target.value;

  //   if (inputValue.length > 3) {
  //     event.target.value = inputValue.slice(0, 3);
  //   }

  //   // Realiza una verificación de nulidad antes de acceder a numberInput
  //   const numberInput = this.updateForm.get("descuento_oferta");
  //   if (numberInput !== null && numberInput.value < 0) {
  //     numberInput.setValue(0);
  //   }
  //   if (numberInput !== null && numberInput.value > 100) {
  //     numberInput.setValue(100);
  //   }
  // }

  // restrictInput(event: any) {
  //   const charCode = event.charCode;
  //   const inputValue = (event.target as HTMLInputElement).value;
  //   const currentValue = parseInt(inputValue, 10); // Convierte el valor a un número entero

  //   // Verifica si el nuevo valor sería menor que 0 o mayor que 100
  //   if (charCode === 45 && currentValue === 0) {
  //     // Evita la entrada de "-" cuando el valor es 0
  //     event.preventDefault();
  //     return;
  //   } else if (currentValue === -1 || (currentValue === 100 && charCode !== 46)) {
  //     // Evita la entrada de "-1" o "100" (excepto el punto decimal para 100.0)
  //     event.preventDefault();
  //     return;
  //   }

  //   if (charCode < 48 || charCode > 57) {
  //     // Evita la entrada de caracteres no numéricos
  //     event.preventDefault();
  //     return;
  //   }
  // }

  // private validateDiscountRange(control: FormControl): { [key: string]: any } | null {
  //   const descuentoControl = control.value;
  //   if (descuentoControl == null) {
  //     return null//Or return an appropriate validation result if needed
  //   }
  //   if (descuentoControl === 0) {
  //     this.showErrorMessage('El descuento de la oferta de la categoria no puede ser cero');
  //     return { 'invalidDiscount': true };
  //   }
  //   return null;
  // }


  // private validateOfertDate(control: FormControl): { [key: string]: any } | null {
  //   const inputDateStr: string = control.value;
  //   const currentDate = new Date();

  //   if (!/^\d{4}-\d{2}-\d{2}$/.test(inputDateStr)) {
  //     return { 'invalidDate': true };
  //   }

  //   const finOfertaDateControl: Date = new Date(inputDateStr);

  //   if (isNaN(finOfertaDateControl.getTime())) {
  //     this.showErrorMessage('La fecha introducida no es válida.');
  //     return { 'invalidDate': true };
  //   }

  //   if (finOfertaDateControl <= currentDate) {
  //     this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
  //     return { 'invalidDate': true };
  //   }

  //   return null;
  // }

  // fileChangeEvent(event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;

  //   if (inputElement.files && inputElement.files.length > 0) {
  //     this.selectedFile = inputElement.files[0];
  //     this.validateAndUpdatePortada(this.selectedFile);
  //   }
  // }

  // private validateAndUpdatePortada(file: File) {
  //   const errors = this.validateFileUpdate(file);
  //   if (errors) {
  //     this.updateForm.get('portada')!.setErrors(errors);
  //   }
  // }

  // private validateFileUpdate(file: File): { [key: string]: any } | null {
  //   if (file) {
  //     const validTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];
  //     if (validTypes.includes(file.type)) {
  //       if (file.size <= 4000000) {
  //         let reader = new FileReader();
  //         reader.readAsDataURL(file);

  //         reader.onload = () => {
  //           if (reader.result !== null) {
  //             this.imageUrl = reader.result as string;
  //             this.updateForm.patchValue({
  //               file: reader.result
  //             });
  //           }
  //         }

  //         this.cd.markForCheck();
  //         return null;
  //       } else {
  //         // console.log('La imagen no puede superar los 4MB');
  //         this.showErrorMessage('La imagen no puede superar los 4MB');
  //         return { invalidFileSize: true };
  //       }
  //     } else {
  //       // console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
  //       this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
  //       return { invalidFileType: true };
  //     }
  //   }

  //   return null;
  // }

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
    // console.info('nombre_categoria:', formValue.nombre_categoria);
    // console.info('icono_categoria:', formValue.icono_categoria);
    // console.info('estado_categoria:', formValue.estado_categoria);
    // console.info('oferta:', formValue.oferta);
    // console.info('descuento_oferta:', formValue.descuento_oferta);
    // console.info('fin_oferta:', formValue.fin_oferta);
    // console.info('portada:', formValue.portada);
    // console.info('file:', this.selectedFile);

    const data: any = {};

    // if (this.selectedFile) {
    //   data.portada = this.selectedFile;
    // }
    data.nombre_categoria = formValue.nombre_categoria;
    data.icono_categoria = formValue.icono_categoria;
    data.estado_categoria = formValue.estado_categoria;
    // data.oferta = formValue.oferta;
    // data.descuento_oferta = formValue.descuento_oferta;
    // data.fin_oferta = formValue.fin_oferta;

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
      nombre_categoria: null,
      icono_categoria: null,
      estado_categoria: true,
      oferta: null,
      // fin_oferta: null,
      // descuento_oferta: null,
      // portada: null, // or '' depending on what you want
    });
    // Optionally, you can also reset the 'imageUrl' to the default image
    // this.imageUrl = 'assets/img/default.jpg';
  }

}

