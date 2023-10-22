import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { AdminService } from "src/app/services/admin.service";
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { OfertaService } from "src/app/services/oferta.service";

declare let iziToast: any;
declare let $: any;
@Component({
  selector: 'app-edit-oferta',
  templateUrl: './edit-oferta.component.html',
  styleUrls: ['./edit-oferta.component.css']
})
export class EditOfertaComponent {

  updateForm!: FormGroup;
  id = '';
  load_data = false;
  config: { height: number };
  token = localStorage.getItem('token');
  load_btn = false;
  imageUrl: any | ArrayBuffer = 'assets/img/default.jpg';

  selectedFile: File | null = null;
  url = GLOBAL.url;

  constructor(
    private _adminService: AdminService,
    private _ofertaService: OfertaService,
    private _router: Router,

    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.config = {
      height: 500,
    };
    this.token = this._adminService.getToken();
    this.updateForm = this.fb.group({
      nombre_oferta: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      estado_oferta: ['', [Validators.required]],
      descripcion_oferta: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descuento_oferta: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      fin_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada_oferta: ['', [Validators.required]],
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
    this._ofertaService.obtener_oferta_admin(this.id, this.token).subscribe(
      response => {
        this.load_data = false;
        if (response.data === undefined) {
          this._router.navigate(['/panel/ofertas']);
        } else {
          const { nombre_oferta, estado_oferta, descripcion_oferta, descuento_oferta, inicio_oferta, fin_oferta, portada, createdAt, updatedAt } = response.data;
          // console.log(response.data)
          // Convert the date format before assigning it to the form control
          const formattedFinOferta = this.convertDateFormat(fin_oferta);
          this.imageUrl = this.url + 'obtener_portada_oferta/' + portada;
          this.updateForm.patchValue({
            nombre_oferta: nombre_oferta,
            estado_oferta: estado_oferta,
            descripcion_oferta: descripcion_oferta,
            descuento_oferta: descuento_oferta,
            inicio_oferta: formattedFinOferta,
            fin_oferta: formattedFinOferta,
            createdAt: createdAt,
            updatedAt: updatedAt
          });

        }
      },
      error => {
        console.log(error);
        this._router.navigate(['/panel/ofertas']);
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

    this.updateForm.get("estado_oferta_oferta")!.valueChanges.subscribe((estado_oferta_ofertaValue) => {
      if (!estado_oferta_ofertaValue) {
        this.showWarningMessage('Las ofertas activas solo')
      }
    });

    const estado_oferta_ofertaControl = this.updateForm.get('estado_oferta_oferta');
    const nombre_ofertaOfertaControl = this.updateForm.get('nombre_oferta');
    const descripcion_ofertaControl = this.updateForm.get('descripcion_oferta');
    const descuento_ofertaControl = this.updateForm.get('descuento_oferta');
    const inicio_ofertaControl = this.updateForm.get('inicio_oferta');
    const fin_ofertaOfertaControl = this.updateForm.get('fin_oferta');
    const portada_ofertaControl = this.updateForm.get('portada_oferta');

    if (estado_oferta_ofertaControl && nombre_ofertaOfertaControl && descuento_ofertaControl && descripcion_ofertaControl && inicio_ofertaControl && fin_ofertaOfertaControl && portada_ofertaControl) {
      estado_oferta_ofertaControl.valueChanges.subscribe((estado_oferta_ofertaValue) => {
        if (estado_oferta_ofertaValue === false) {
          this.imageUrl = 'assets/img/default.jpg';
          this.selectedFile = null;
          [nombre_ofertaOfertaControl, descripcion_ofertaControl, descuento_ofertaControl, inicio_ofertaControl, fin_ofertaOfertaControl, portada_ofertaControl].forEach(control => {
            control.disable({ onlySelf: true });
          });
        } else {
          [nombre_ofertaOfertaControl, descripcion_ofertaControl, descuento_ofertaControl, inicio_ofertaControl, fin_ofertaOfertaControl, portada_ofertaControl].forEach(control => {
            control.enable({ onlySelf: true });
          });
        }
      });
    }

  }

  get nombre_oferta() {
    return this.updateForm.get("nombre_oferta")!;
  }

  get icono() {
    return this.updateForm.get("icono")!;
  }

  get estado_oferta() {
    return this.updateForm.get("estado_oferta")!;
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

    const ofertaDate: Date = new Date(inputDateStr);

    if (isNaN(ofertaDate.getTime())) {
      this.showErrorMessage('La fecha introducida no es válida.');
      return { 'invalidDate': true };
    }

    if (ofertaDate < currentDate) {
      this.showErrorMessage('La fecha de inicio de la oferta no puede ser anterior a la fecha actual.');
      return { 'invalidStartDate': true };
    }

    const endDateControl = this.updateForm.get('fin_oferta');
    const startDateControl = this.updateForm.get('inicio_oferta');

    if (endDateControl && endDateControl.value) {
      const endDate: Date = new Date(endDateControl.value);
      if (endDate < currentDate) {
        this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
        return { 'invalidEndDate': true };
      }
      if (startDateControl && startDateControl.value) {
        const startDate: Date = new Date(startDateControl.value);
        if (endDate < startDate) {
          this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha de inicio.');
          return { 'invalidEndDate': true };
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
    console.info('nombre_oferta:', formValue.nombre_oferta);
    console.info('estado_oferta:', formValue.estado_oferta);
    console.info('descripcion_oferta:', formValue.descripcion_oferta);
    console.info('descuento:', formValue.descuento_oferta);
    console.info('inicio:', formValue.inicio_oferta);
    console.info('fin:', formValue.fin_oferta);
    console.info('portada_oferta:', formValue.portada_oferta);
    console.info('file:', this.selectedFile);

    const data: any = {};

    if (this.selectedFile) {
      data.portada = this.selectedFile;
    }
    data.nombre_oferta = formValue.nombre_oferta;
    data.icono = formValue.icono;
    data.estado_oferta = formValue.estado_oferta;
    data.oferta = formValue.oferta;
    data.descuento_oferta = formValue.descuento_oferta;
    data.fin_oferta = formValue.fin_oferta;

    this.load_btn = true;
    this._ofertaService.actualizar_oferta_admin(data, this.id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se actualizó correctamente el nuevo oferta.');
        this.load_btn = false;
        this._router.navigate(['/panel/ofertas']);
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
      nombre_oferta: null,
      descuento_oferta: null,
      descripcion_oferta: null,
      inicio_oferta: null,
      fin_oferta: null,
      portada_oferta: null,
      estado_oferta: false,
    });
    // Optionally, you can also reset the 'imageUrl' to the default image
    // this.imageUrl = 'assets/img/default.jpg';
  }

}
