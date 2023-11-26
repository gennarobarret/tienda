import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { AdminService } from "src/app/services/admin.service";
import { ProductoService } from 'src/app/services/producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { SubcategoriaService } from "src/app/services/subcategoria.service";
import { OfertaService } from 'src/app/services/oferta.service';
import { CategoriaService } from "src/app/services/categoria.service";


declare let iziToast: any;
declare let $: any;

@Component({
  selector: 'app-create-producto',
  templateUrl: './create-producto.component.html',
  styleUrls: ['./create-producto.component.css']
})

export class CreateProductoComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;


  productoForm!: FormGroup;
  config: { height: number };
  token: any;
  load_btn = false;
  imageUrl: any | ArrayBuffer = 'assets/img/default.jpg';
  selectedFile: File | null = null;


  constructor(
    private fb: FormBuilder,
    private _adminService: AdminService,
    private _cartegoriaService: CategoriaService,
    private _subcategoriaService: SubcategoriaService,
    private _ofertaService: OfertaService,
    private _productoService: ProductoService,
    private _proveedorService: ProveedorService,
    private _router: Router,
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

  initializeForm(): void {

    this.productoForm = this.fb.group({
      nombre_producto: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descripcion_producto: ['', [Validators.required, Validators.maxLength(500), Validators.pattern("^[a-zA-Z0-9\\sñÑ!¡.*áéíóúÁÉÍÓÚ:%-,;]+$")]],
      descuento_producto: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio_producto: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      fin_producto: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada_producto: ['', [Validators.required]],
      estado_producto: [{ value: true, disabled: true }, [Validators.required]],
      nivel_producto: ['Nivel', [Validators.required]],
    });
  }

  subscribeToFormChanges(): void {

  }

  get nombre_producto() {
    return this.productoForm.get("nombre_producto")!;
  }

  get descripcion_producto() {
    return this.productoForm.get("descripcion_producto")!;
  }

  get descuento_producto() {
    return this.productoForm.get("descuento_producto")!;
  }

  get inicio_producto() {
    return this.productoForm.get("inicio_producto")!;
  }

  get fin_producto() {
    return this.productoForm.get("fin_producto")!;
  }

  get portada_producto() {
    return this.productoForm.get("portada_producto")!;
  }

  get estado_producto() {
    return this.productoForm.get("estado_producto")!;
  }

  get nivel_producto() {
    return this.productoForm.get("nivel_producto")!;
  }

  limitInputLength(event: any) {
    const inputValue = event.target.value;

    if (inputValue.length > 3) {
      event.target.value = inputValue.slice(0, 3);
    }

    // Realiza una verificación de nulidad antes de acceder a numberInput
    const numberInput = this.productoForm.get("descuento_producto");
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
      return null
    }
    if (descuentoControl === 0) {
      this.showErrorMessage('El descuento de la producto de la producto no puede ser cero');
      return { 'invalidDiscount': true };
    }
    return null;
  }


  private validateOfertDate(control: FormControl): { [key: string]: any } | null {
    const currentDate = new Date();
    const inputDateTimeStr: string = control.value;

    // Validación de formato de fecha y hora
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(inputDateTimeStr)) {
      return { 'invalidDateTimeFormat': true };
    }

    const startDateControl = this.productoForm.get('inicio_producto');
    const endDateControl = this.productoForm.get('fin_producto');

    if (startDateControl && startDateControl.value) {
      const endDate: Date = new Date(endDateControl?.value);
      const startDate: Date = new Date(startDateControl?.value);

      if (startDate < currentDate) {
        this.showErrorMessage('La fecha y hora de inicio de la producto no puede ser anterior a la fecha y hora actual.');
        return { 'invalidDateStart<Current': true };
      }

      if (endDateControl && endDateControl.value) {
        if (startDate > endDate) {
          // this.productoForm.patchValue({ fin_producto: null });
          startDateControl.setErrors(null);
          this.showErrorMessage('Debes corregir la fecha de finalización de la producto, la fecha de finalización de la producto no puede ser anterior a la fecha inicial.');
          return { 'invalidDateEnd<Start': true };
        } else {
          endDateControl.setErrors(null);
        }
      }
    }

    if (endDateControl && endDateControl.value) {
      const endDate: Date = new Date(endDateControl?.value);
      if (endDate < currentDate) {
        this.showErrorMessage('La fecha y hora de finalización de la producto no puede ser anterior a la fecha actual.');
        return { 'invalidDateEnd<Current': true };
      }

      if (startDateControl && startDateControl.value) {
        const startDate: Date = new Date(startDateControl?.value);
        if (endDate < startDate) {
          this.showErrorMessage('La fecha y hora de finalización de la producto no puede ser anterior a la fecha inicial.');
          return { 'invalidDateEnd<Start': true };
        }
        if (endDate > startDate) {
          startDateControl.setErrors(null);
        }
      } else {
        this.showErrorMessage('Debes seleccionar una fecha de inicio antes de seleccionar la fecha de finalización.');
        return { 'noStartDate': true };
      }
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
      this.productoForm.get('portada_producto')!.setErrors(errors);
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
              this.productoForm.patchValue({
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

  public registro(): void {
    if (this.productoForm.invalid) {
      for (const control of Object.keys(this.productoForm.controls)) {
        this.productoForm.controls[control].markAsTouched();
      }
      this.load_btn = false;
      this.showErrorMessage("Hay errores en el formulario. Por favor, verifica los campos.");
      return;
    }

    const formValue = this.productoForm.value;

    // console.info('nombre_producto:', formValue.nombre_producto);
    // console.info('descripcion_producto:', formValue.descripcion_producto);
    // console.info('descuento:', formValue.descuento_producto);
    // console.info('inicio:', formValue.inicio_producto);
    // console.info('fin:', formValue.fin_producto);
    // console.info('portada_producto:', formValue.portada_producto);
    // console.info('file:', this.selectedFile);
    // console.info('nivel:', formValue.nivel_producto);

    const filtro = formValue.nombre_producto.toLowerCase();
    // this._productoService.listar_productos_admin(filtro, this.token).subscribe(
    //   (nombre_productos) => {
    //     const nombre_productoBuscado = nombre_productos.data.map((element: any) => element.nombre_producto);
    //     if (nombre_productoBuscado.includes(filtro)) {
    //       this.productoForm.controls['nombre_producto'].setErrors({ 'repeatedTitleError': true });
    //       this.showErrorMessage('listar Ya existe una producto asociada a ese título en la base de datos');
    //       return;
    //     } else {
    //       this._productoService.registro_producto_admin(formValue, this.selectedFile, this.token).subscribe(
    //         (response) => {
    //           this.showSuccessMessage('Se registró correctamente la producto.');
    //           this.load_btn = true;
    //           this._router.navigate(['/panel/productos']);
    //         },
    //         (error) => {
    //           if (error.status === 409 && error.error.message === 'Ya existe una producto con el mismo título.') {
    //             this.showErrorMessage('Ya existe una producto asociada a ese título en la base de datos');
    //             this.productoForm.controls['nombre_producto'].setErrors({ 'repeatedTitleError': true });
    //           } else {
    //             this.showErrorMessage('Ocurrió un error en el Registro');
    //           }
    //           this.load_btn = false;
    //         }
    //       );
    //     }
    //   },
    //   (error) => {
    //     this.showErrorMessage('Ocurrió un error en al buscar nombre de la producto en base de datos');
    //     this.load_btn = false;
    //   }
    // );
  }

  resetForm(): void {
    this.productoForm = this.fb.group({
      nombre_producto: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descripcion_producto: ['', [Validators.required, Validators.maxLength(500), Validators.pattern("^[a-zA-Z0-9\\sñÑ!¡.*áéíóúÁÉÍÓÚ:%-,;]+$")]],
      descuento_producto: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio_producto: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      fin_producto: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada_producto: ['', [Validators.required]],
      estado_producto: [{ value: true, disabled: true }, [Validators.required]],
      nivel_producto: ['Nivel', [Validators.required]],
    });

    // Optionally, you can also reset the 'imageUrl' to the default image
    this.imageUrl = 'assets/img/default.jpg';
  }


  // resetForm(): void {
  //   // Reset the 'portada_producto' form control to null or an empty value
  //   this.productoForm.patchValue({
  //     nombre_producto: null,
  //     descuento_producto: null,
  //     descripcion_producto: null,
  //     inicio_producto: null,
  //     fin_producto: null,
  //     portada_producto: null,
  //     estado_producto: true,
  //   });

  //   // Disable the controls that need to be initially disabled
  //   // this.productoForm.get('descuento_producto')?.disable({ onlySelf: true });
  //   // this.productoForm.get('fin_producto')?.disable({ onlySelf: true });
  //   // this.productoForm.get('portada_producto')?.disable({ onlySelf: true });
  //   // Optionally, you can also reset the 'imageUrl' to the default image
  //   // this.imageUrl = 'assets/img/default.jpg';
  // }

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

}








// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { AdminService } from 'src/app/services/admin.service';
// import { ProductoService } from 'src/app/services/producto.service';
// import { ProveedorService } from 'src/app/services/proveedor.service';

// declare var iziToast: any;
// declare var jQuery: any;
// declare var $: any;

// @Component({
//   selector: 'app-create-producto',
//   templateUrl: './create-producto.component.html',
//   styleUrls: ['./create-producto.component.css']
// })
// export class CreateProductoComponent implements OnInit {

//   public producto: any = {
//     categoria: ''
//   };
//   public proveedores: Array<any> = [];
//   public file: any = undefined;
//   public imgSelect: any | ArrayBuffer = 'assets/img/default.jpg';
//   public config: any = {};
//   public token;
//   public load_btn = false;
//   public config_global: any = {};


//   constructor(
//     private _productoService: ProductoService,
//     private _proveedorService: ProveedorService,
//     private _adminService: AdminService,
//     private _router: Router
//   ) {
//     this.config = {
//       height: 500
//     }
//     this.token = this._adminService.getToken();
//     // this._adminService.obtener_config_publico().subscribe(
//     //   response => {
//     //     this.config_global = response.data;
//     //     console.log(this.config_global);

//     //   }
//     // )
//   }

//   ngOnInit(): void {
//     this.getProviders();
//   }

//   getProviders() {
//     this._proveedorService
//       .listar_proveedores_filtro_admin(null, null, this.token)
//       .subscribe(
//         (response) => {
//           this.proveedores = response.data;
//           this.proveedores.sort((a, b) => a.company.localeCompare(b.company));
//           console.log(this.proveedores);
//         },
//         (error) => {
//           console.error(error);
//         }
//       );
//   }

//   registro(registroForm: any) {
//     if (registroForm.valid) {
//       if (this.file == undefined) {
//         iziToast.show({
//           title: 'ERROR',
//           titleColor: '#FF0000',
//           color: '#FFF',
//           class: 'text-danger',
//           position: 'topRight',
//           message: 'Debe subir una portada para registrar'
//         });
//       } else {
//         console.log(this.producto);
//         console.log(this.file);
//         this.load_btn = true;
//         this._productoService.registro_producto_admin(this.producto, this.file, this.token).subscribe(
//           response => {
//             iziToast.show({
//               title: 'SUCCESS',
//               titleColor: '#1DC74C',
//               color: '#FFF',
//               class: 'text-success',
//               position: 'topRight',
//               message: 'Se registro correctamente el nuevo producto.'
//             });
//             this.load_btn = false;

//             this._router.navigate(['/panel/productos']);
//           },
//           error => {
//             console.log(error);
//             this.load_btn = false;
//           }
//         );
//       }

//     } else {
//       iziToast.show({
//         title: 'ERROR',
//         titleColor: '#FF0000',
//         color: '#FFF',
//         class: 'text-danger',
//         position: 'topRight',
//         message: 'Los datos del formulario no son validos'
//       });
//       this.load_btn = false;

//       $('#input-portada').text('Seleccionar imagen');
//       this.imgSelect = 'assets/img/default.jpg';
//       this.file = undefined;
//     }
//   }

//   fileChangeEvent(event: any): void {
//     var file: any;
//     if (event.target.files && event.target.files[0]) {
//       file = <File>event.target.files[0];


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
//         console.log(this.imgSelect);

//         reader.readAsDataURL(file);

//         $('#input-portada').text(file.name);
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
//         this.imgSelect = 'assets/img/default.jpg';
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
//       this.imgSelect = 'assets/img/default.jpg';
//       this.file = undefined;
//     }

//     console.log(this.file);

//   }

// }
