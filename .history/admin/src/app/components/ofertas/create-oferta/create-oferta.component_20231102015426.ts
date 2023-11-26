import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { AdminService } from "src/app/services/admin.service";
import { OfertaService } from "src/app/services/oferta.service";

declare let iziToast: any;
declare let $: any;

@Component({
  selector: "app-create-oferta",
  templateUrl: "./create-oferta.component.html",
  styleUrls: ["./create-oferta.component.css"],
})

export class CreateOfertaComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;


  ofertaForm!: FormGroup;
  config: { height: number };
  token: any;
  load_btn = false;
  imageUrl: any | ArrayBuffer = 'assets/img/default.jpg';
  selectedFile: File | null = null;
  niveles: any[] = [
    {
      "level": "Categorias",
    },
    {
      "level": "Subcategorias",
    },
    {
      "level": "Productos",
    },
  ];

  constructor(
    private fb: FormBuilder,
    private _adminService: AdminService,
    private _ofertaService: OfertaService,
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

    this.ofertaForm = this.fb.group({
      nombre_oferta: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descripcion_oferta: ['', [Validators.required, Validators.maxLength(500), Validators.pattern("^[a-zA-Z0-9\\sñÑ!¡.*áéíóúÁÉÍÓÚ:%-,;]+$")]],
      descuento_oferta: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      fin_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada_oferta: ['', [Validators.required]],
      estado_oferta: [{ value: true, disabled: true }, [Validators.required]],
      nivel_oferta: [null, [Validators.required]],
    });
  }

  subscribeToFormChanges(): void {

    this.ofertaForm.get("estado_oferta")!.valueChanges.subscribe((estado_ofertaValue) => {
      if (!estado_ofertaValue) {
        this.showWarningMessage('Las ofertas activas solo')
      }
    });

    const nombre_ofertaOfertaControl = this.ofertaForm.get('nombre_oferta');
    const descripcion_ofertaControl = this.ofertaForm.get('descripcion_oferta');
    const descuento_ofertaControl = this.ofertaForm.get('descuento_oferta');
    const inicio_ofertaControl = this.ofertaForm.get('inicio_oferta');
    const fin_ofertaOfertaControl = this.ofertaForm.get('fin_oferta');
    const estado_ofertaControl = this.ofertaForm.get('estado_oferta');
    const portada_ofertaControl = this.ofertaForm.get('portada_oferta');
    const nivel_ofertaControl = this.ofertaForm.get('nivel_oferta');

    if (nombre_ofertaOfertaControl && descuento_ofertaControl && descripcion_ofertaControl && inicio_ofertaControl && fin_ofertaOfertaControl && estado_ofertaControl && portada_ofertaControl && nivel_ofertaControl) {
      estado_ofertaControl.valueChanges.subscribe((estado_ofertaValue) => {
        if (estado_ofertaValue === false) {
          this.imageUrl = 'assets/img/default.jpg';
          this.selectedFile = null;
          [nombre_ofertaOfertaControl, descripcion_ofertaControl, descuento_ofertaControl, inicio_ofertaControl, fin_ofertaOfertaControl, portada_ofertaControl, nivel_ofertaControl].forEach(control => {
            control.disable({ onlySelf: true });
          });
        } else {
          [nombre_ofertaOfertaControl, descripcion_ofertaControl, descuento_ofertaControl, inicio_ofertaControl, fin_ofertaOfertaControl, portada_ofertaControl, nivel_ofertaControl].forEach(control => {
            control.enable({ onlySelf: true });
          });
        }
      });
    }

  }

  get nombre_oferta() {
    return this.ofertaForm.get("nombre_oferta")!;
  }

  get descripcion_oferta() {
    return this.ofertaForm.get("descripcion_oferta")!;
  }

  get descuento_oferta() {
    return this.ofertaForm.get("descuento_oferta")!;
  }

  get inicio_oferta() {
    return this.ofertaForm.get("inicio_oferta")!;
  }

  get fin_oferta() {
    return this.ofertaForm.get("fin_oferta")!;
  }

  get portada_oferta() {
    return this.ofertaForm.get("portada_oferta")!;
  }

  get estado_oferta() {
    return this.ofertaForm.get("estado_oferta")!;
  }

  get nivel_oferta() {
    return this.ofertaForm.get("nivel_oferta")!;
  }

  limitInputLength(event: any) {
    const inputValue = event.target.value;

    if (inputValue.length > 3) {
      event.target.value = inputValue.slice(0, 3);
    }

    // Realiza una verificación de nulidad antes de acceder a numberInput
    const numberInput = this.ofertaForm.get("descuento_oferta");
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
      this.showErrorMessage('El descuento de la oferta de la oferta no puede ser cero');
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

    const startDateControl = this.ofertaForm.get('inicio_oferta');
    const endDateControl = this.ofertaForm.get('fin_oferta');

    if (startDateControl && startDateControl.value) {
      const endDate: Date = new Date(endDateControl?.value);
      const startDate: Date = new Date(startDateControl?.value);

      if (startDate < currentDate) {
        this.showErrorMessage('La fecha y hora de inicio de la oferta no puede ser anterior a la fecha y hora actual.');
        return { 'invalidDateStart<Current': true };
      }

      if (endDateControl && endDateControl.value) {
        if (startDate > endDate) {
          // this.ofertaForm.patchValue({ fin_oferta: null });
          startDateControl.setErrors(null);
          this.showErrorMessage('Debes corregir la fecha de finalización de la oferta, la fecha de finalización de la oferta no puede ser anterior a la fecha inicial.');
          return { 'invalidDateEnd<Start': true };
        } else {
          endDateControl.setErrors(null);
        }
      }
    }

    if (endDateControl && endDateControl.value) {
      const endDate: Date = new Date(endDateControl?.value);
      if (endDate < currentDate) {
        this.showErrorMessage('La fecha y hora de finalización de la oferta no puede ser anterior a la fecha actual.');
        return { 'invalidDateEnd<Current': true };
      }

      if (startDateControl && startDateControl.value) {
        const startDate: Date = new Date(startDateControl?.value);
        if (endDate < startDate) {
          this.showErrorMessage('La fecha y hora de finalización de la oferta no puede ser anterior a la fecha inicial.');
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
      this.ofertaForm.get('portada_oferta')!.setErrors(errors);
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
              this.ofertaForm.patchValue({
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
    if (this.ofertaForm.invalid) {
      for (const control of Object.keys(this.ofertaForm.controls)) {
        this.ofertaForm.controls[control].markAsTouched();
      }
      this.load_btn = false;
      this.showErrorMessage("Hay errores en el formulario. Por favor, verifica los campos.");
      return;
    }

    const formValue = this.ofertaForm.value;

    console.info('nombre_oferta:', formValue.nombre_oferta);
    console.info('descripcion_oferta:', formValue.descripcion_oferta);
    console.info('descuento:', formValue.descuento_oferta);
    console.info('inicio:', formValue.inicio_oferta);
    console.info('fin:', formValue.fin_oferta);
    console.info('portada_oferta:', formValue.portada_oferta);
    console.info('file:', this.selectedFile);
    console.info('nivel:', formValue.nivel_oferta);

    // const filtro = formValue.nombre_oferta.toLowerCase();
    // this._ofertaService.listar_ofertas_admin(filtro, this.token).subscribe(
    //   (nombre_ofertas) => {
    //     const nombre_ofertaBuscado = nombre_ofertas.data.map((element: any) => element.nombre_oferta);
    //     if (nombre_ofertaBuscado.includes(filtro)) {
    //       this.ofertaForm.controls['nombre_oferta'].setErrors({ 'repeatedTitleError': true });
    //       this.showErrorMessage('listar Ya existe una oferta asociada a ese título en la base de datos');
    //       return;
    //     } else {
    //       this._ofertaService.registro_oferta_admin(formValue, this.selectedFile, this.token).subscribe(
    //         (response) => {
    //           this.showSuccessMessage('Se registró correctamente la oferta.');
    //           this.load_btn = true;
    //           this._router.navigate(['/panel/ofertas']);
    //         },
    //         (error) => {
    //           if (error.status === 409 && error.error.message === 'Ya existe una oferta con el mismo título.') {
    //             this.showErrorMessage('Ya existe una oferta asociada a ese título en la base de datos');
    //             this.ofertaForm.controls['nombre_oferta'].setErrors({ 'repeatedTitleError': true });
    //           } else {
    //             this.showErrorMessage('Ocurrió un error en el Registro');
    //           }
    //           this.load_btn = false;
    //         }
    //       );
    //     }
    //   },
    //   (error) => {
    //     this.showErrorMessage('Ocurrió un error en al buscar nombre de la oferta en base de datos');
    //     this.load_btn = false;
    //   }
    // );
  }

  resetForm(): void {
    this.ofertaForm = this.fb.group({
      nombre_oferta: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descripcion_oferta: ['', [Validators.required, Validators.maxLength(500), Validators.pattern("^[a-zA-Z0-9\\sñÑ!¡.*áéíóúÁÉÍÓÚ:%-,;]+$")]],
      descuento_oferta: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      fin_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada_oferta: ['', [Validators.required]],
      estado_oferta: [{ value: true, disabled: true }, [Validators.required]],
      nivel_oferta: [null, [Validators.required]],
    });

    // Optionally, you can also reset the 'imageUrl' to the default image
    this.imageUrl = 'assets/img/default.jpg';
  }


  // resetForm(): void {
  //   // Reset the 'portada_oferta' form control to null or an empty value
  //   this.ofertaForm.patchValue({
  //     nombre_oferta: null,
  //     descuento_oferta: null,
  //     descripcion_oferta: null,
  //     inicio_oferta: null,
  //     fin_oferta: null,
  //     portada_oferta: null,
  //     estado_oferta: true,
  //   });

  //   // Disable the controls that need to be initially disabled
  //   // this.ofertaForm.get('descuento_oferta')?.disable({ onlySelf: true });
  //   // this.ofertaForm.get('fin_oferta')?.disable({ onlySelf: true });
  //   // this.ofertaForm.get('portada_oferta')?.disable({ onlySelf: true });
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