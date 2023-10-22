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
      nombre: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descripcion: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descuento: [{ value: null, disabled: true }, [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio: [{ value: '', disabled: true }, [Validators.required, this.validateOfertDate.bind(this)]],
      fin: [{ value: '', disabled: true }, [Validators.required, this.validateOfertDate.bind(this)]],
      portada: [{ value: null, disabled: true }, [Validators.required]],
      estado: [false, [Validators.required]],
    });
  }

  subscribeToFormChanges(): void {

    this.ofertaForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
      if (!estadoValue) {
        this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
      }
    });

    const estadoControl = this.ofertaForm.get('estado');
    const descuentoOfertaControl = this.ofertaForm.get('descuento_oferta');
    const fechaOfertaControl = this.ofertaForm.get('fin_oferta');
    const portadaControl = this.ofertaForm.get('portada');

    if (estadoControl && descuentoOfertaControl && fechaOfertaControl && portadaControl) {
      estadoControl.valueChanges.subscribe((estadoValue) => {
        if (estadoValue === false) {
          this.imageUrl = 'assets/img/default.jpg';
          this.selectedFile = null;
          [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
            control.disable({ onlySelf: true });
          });
        } else {
          [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
            control.enable({ onlySelf: true });
          });
        }
      });
    }

  }

  get nombre() {
    return this.ofertaForm.get("nombre")!;
  }

  get descripcion() {
    return this.ofertaForm.get("icono")!;
  }

  get descuento_oferta() {
    return this.ofertaForm.get("descuento_oferta")!;
  }

  get inicio_oferta() {
    return this.ofertaForm.get("fin_oferta")!;
  }

  get fin_oferta() {
    return this.ofertaForm.get("fin_oferta")!;
  }

  get portada() {
    return this.ofertaForm.get("portada")!;
  }

  get estado() {
    return this.ofertaForm.get("estado")!;
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
      this.ofertaForm.get('portada')!.setErrors(errors);
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
    // console.info('nombre:', formValue.nombre);
    // console.info('estado:', formValue.estado);
    // console.info('descripcion:', formValue.descripcion);
    // console.info('descuento:', formValue.descuento_oferta);
    // console.info('inicio:', formValue.inicio_oferta);
    // console.info('fin:', formValue.fin_oferta);
    // console.info('portada:', formValue.portada);
    // console.info('file:', this.selectedFile);

    const filtro = formValue.nombre.toLowerCase();
    this._ofertaService.listar_ofertas_admin(filtro, this.token).subscribe(
      (nombres) => {
        const nombreBuscado = nombres.data.map((element: any) => element.nombre);
        if (nombreBuscado.includes(filtro)) {
          // Set the repeatedTitleError on the nombre form control
          this.ofertaForm.controls['nombre'].setErrors({ 'repeatedTitleError': true });
          this.showErrorMessage('listar Ya existe una categoría asociada a ese título en la base de datos');
          // Now the error message will be displayed in the template
          return;
        } else {
          this._ofertaService.registro_oferta_admin(formValue, this.selectedFile, this.token).subscribe(
            (response) => {

              this.showSuccessMessage('Se registró correctamente la categoría.');
              this.load_btn = true;
              this._router.navigate(['/panel/ofertas']);

            },
            (error) => {
              if (error.status === 409 && error.error.message === 'Ya existe una categoría con el mismo título.') {
                this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                this.ofertaForm.controls['nombre'].setErrors({ 'repeatedTitleError': true });
              } else {
                this.showErrorMessage('Ocurrió un error en el Registro');
              }
              this.load_btn = false;
            }
          );
        }
      },
      (error) => {
        this.showErrorMessage('Ocurrió un error en el registro');
        this.load_btn = false;
      }
    );
  }

  resetForm(): void {
    // Reset the 'portada' form control to null or an empty value
    this.ofertaForm.patchValue({
      nombre: null,
      descuento: null,
      descripcion: null,
      inicio: null,
      fin: null,
      portada: null,
      estado: false,
    });

    // Disable the controls that need to be initially disabled
    this.ofertaForm.get('descuento_oferta')?.disable({ onlySelf: true });
    this.ofertaForm.get('fin_oferta')?.disable({ onlySelf: true });
    this.ofertaForm.get('portada')?.disable({ onlySelf: true });
    // Optionally, you can also reset the 'imageUrl' to the default image
    // this.imageUrl = 'assets/img/default.jpg';
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

}