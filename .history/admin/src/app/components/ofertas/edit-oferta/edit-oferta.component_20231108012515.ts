import { Component, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

import { AdminService } from "src/app/services/admin.service";
import { OfertaService } from "src/app/services/oferta.service";
import { CategoriaService } from "src/app/services/categoria.service";
import { SubcategoriaService } from 'src/app/services/subcategoria.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

declare let iziToast: any;

@Component({
  selector: 'app-edit-oferta',
  templateUrl: './edit-oferta.component.html',
  styleUrls: ['./edit-oferta.component.css']
})
export class EditOfertaComponent {

  updateForm!: FormGroup;
  id: string = '';
  config: { height: number };
  token = localStorage.getItem('token');
  load_data = false;
  load_btn = false;
  imageUrl: any | ArrayBuffer = 'assets/img/default.jpg';
  selectedFile: File | null = null;
  url = GLOBAL.url;
  filtro = '';
  private nombre: string = '';
  ofertaEncontradaCat: boolean = false;
  ofertaEncontradaSubcat: boolean = false;

  constructor(
    private _adminService: AdminService,
    private _ofertaService: OfertaService,
    private _categoriaService: CategoriaService,
    private _subcategoriaService: SubcategoriaService,
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
      nombre_oferta: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      descripcion_oferta: ['', [Validators.required, Validators.maxLength(500), Validators.pattern("^[a-zA-Z0-9\\sñÑ!¡.*áéíóúÁÉÍÓÚ:%-,;]+$")]],
      descuento_oferta: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      inicio_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      fin_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada_oferta: ['', [Validators.required]],
      estado_oferta: ['', [Validators.required]],
      nivel_oferta: ['', [Validators.required]],
      createdAt: [''],
      updatedAt: [''],
    });
  }

  ngOnInit(): void {
    // Lógica para inicializar el formulario
    this.getRouteParams();
    this.initializeForm();
    this.subscribeToFormChanges();
  }


  // Métodos para manejar los valores actualizados
  convertDateFormat(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Métodos para la inicialización del formulario y obtención de datos
  getRouteParams() {
    this._route.params.subscribe(params => {
      this.id = params['id'];
    });
  }
  initializeForm() {
    this._ofertaService.obtener_oferta_admin(this.id, this.token).subscribe(
      ofertasResponse => {
        this.load_data = false;
        if (ofertasResponse.data === undefined) {
          this._router.navigate(['/panel/ofertas']);
        } else {
          const { _id, nombre_oferta, estado_oferta, descripcion_oferta, descuento_oferta, inicio_oferta, fin_oferta, portada_oferta, nivel_oferta, createdAt, updatedAt } = ofertasResponse.data;
          // console.log('ID de la oferta:', _id);
          const formatteInicioOferta = this.convertDateFormat(inicio_oferta);
          const formattedFinOferta = this.convertDateFormat(fin_oferta);
          this.imageUrl = this.url + 'obtener_portada_oferta/' + portada_oferta;
          this.nombre = nombre_oferta;

          this.updateForm.patchValue({
            nombre_oferta: nombre_oferta,
            estado_oferta: estado_oferta,
            descripcion_oferta: descripcion_oferta,
            descuento_oferta: descuento_oferta,
            inicio_oferta: formatteInicioOferta,
            fin_oferta: formattedFinOferta,
            nivel_oferta: nivel_oferta,
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

    this._subcategoriaService.listar_subcategorias_admin(this.filtro, this.token).subscribe(
      subcategoriasResponse => {
        const ofertas_subcategorias = subcategoriasResponse.data;
        this.ofertaEncontradaSubcat = this.checkOfferInSubcategories(ofertas_subcategorias);
        // Aquí puedes llamar una función o realizar operaciones con el valor actualizado
        this.doSomethingWithSubcatValue(this.ofertaEncontradaSubcat);
      },
      error => {
        console.log(error);
        this._router.navigate(['/panel/ofertas']);
      }
    );

    this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
      (categoriasResponse: any) => {
        const ofertas_categorias = categoriasResponse.data;
        this.ofertaEncontradaCat = this.checkOfferInCategories(ofertas_categorias);
        // Aquí puedes llamar una función o realizar operaciones con el valor actualizado
        this.doSomethingWithCatValue(this.ofertaEncontradaCat);

      },
      error => {
        console.log(error);
        this._router.navigate(['/panel/ofertas']);
      }
    );
  }

  // Métodos para comprobar ofertas en subcategorías y categorías
  checkOfferInSubcategories(ofertas_subcategorias: any[]): boolean {
    let encontrada = false;
    ofertas_subcategorias.forEach((subcategoria: any) => {
      subcategoria.ofertas_categoria.forEach((oferta: any) => {
        const idOferta = oferta._id;
        if (idOferta === this.id) {
          encontrada = true;
        }
      });
    });
    return encontrada;
  }
  checkOfferInCategories(ofertas_categorias: any[]): boolean {
    let encontrada = false;

    ofertas_categorias.forEach((categoria: any) => {
      categoria.ofertas_categoria.forEach((oferta: any) => {
        const idOferta = oferta._id;
        if (idOferta === this.id) {
          encontrada = true;
        }
      });
    });

    return encontrada;
  }

  // Métodos para manejar los valores actualizados
  doSomethingWithSubcatValue(value: boolean) {
    const nivel_ofertaControl = this.updateForm.get('nivel_oferta');
    const estado_ofertaControl = this.updateForm.get('estado_oferta');
    if (value === true) { nivel_ofertaControl?.disable(); }
    if (estado_ofertaControl && nivel_ofertaControl) {
      estado_ofertaControl.valueChanges.subscribe((ofertaValue) => {
        [nivel_ofertaControl].forEach(control => {
          if (value === false) {
            if (ofertaValue === false) {
              control.disable({ onlySelf: true });
            } else {
              control.enable({ onlySelf: true });
            }
          } else {
            nivel_ofertaControl?.disable();
          }
        });
      });
    }
  }
  doSomethingWithCatValue(value: boolean) {
    const nivel_ofertaControl = this.updateForm.get('nivel_oferta');
    const estado_ofertaControl = this.updateForm.get('estado_oferta');
    if (value === true) { nivel_ofertaControl?.disable(); }
    if (estado_ofertaControl && nivel_ofertaControl) {
      estado_ofertaControl.valueChanges.subscribe((ofertaValue) => {
        [nivel_ofertaControl].forEach(control => {

          console.log('SubcatValue', value);
          if (value === false) {

            if (ofertaValue === false) {
              control.disable({ onlySelf: true });
            } else {
              control.enable({ onlySelf: true });
            }
          } else {
            nivel_ofertaControl?.disable();
          }
        });
      });
    }
  }

  subscribeToFormChanges(): void {

    const estado_ofertaControl = this.updateForm.get('estado_oferta');
    const nombre_ofertaControl = this.updateForm.get('nombre_oferta');
    const descripcion_ofertaControl = this.updateForm.get('descripcion_oferta');
    const descuento_ofertaControl = this.updateForm.get('descuento_oferta');
    const inicio_ofertaControl = this.updateForm.get('inicio_oferta');
    const fin_ofertaControl = this.updateForm.get('fin_oferta');
    const portada_ofertaControl = this.updateForm.get('portada_oferta');

    if (estado_ofertaControl && nombre_ofertaControl && descripcion_ofertaControl && descuento_ofertaControl && inicio_ofertaControl && fin_ofertaControl && portada_ofertaControl) {
      estado_ofertaControl.valueChanges.subscribe((ofertaValue) => {

        [nombre_ofertaControl, descripcion_ofertaControl, descuento_ofertaControl, inicio_ofertaControl, fin_ofertaControl, portada_ofertaControl].forEach(control => {
          if (ofertaValue === false) {
            control.disable({ onlySelf: true });
          } else {
            control.enable({ onlySelf: true });
          }
        });
      });
    }
  }

  get nombre_oferta() {
    return this.updateForm.get("nombre_oferta")!;
  }

  get descripcion_oferta() {
    return this.updateForm.get("descripcion_oferta")!;
  }

  get descuento_oferta() {
    return this.updateForm.get("descuento_oferta")!;
  }

  get inicio_oferta() {
    return this.updateForm.get("inicio_oferta")!;
  }

  get fin_oferta() {
    return this.updateForm.get("fin_oferta")!;
  }

  get portada_oferta() {
    return this.updateForm.get("portada_oferta")!;
  }

  get estado_oferta() {
    return this.updateForm.get("estado_oferta")!;
  }

  get nivel_oferta() {
    return this.updateForm.get("nivel_oferta")!;
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
    const currentDate = new Date();
    const inputDateTimeStr: string = control.value;

    // Validación de formato de fecha y hora
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(inputDateTimeStr)) {
      return { 'invalidDateTimeFormat': true };
    }

    const startDateControl = this.updateForm.get('inicio_oferta');
    const endDateControl = this.updateForm.get('fin_oferta');

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
      this.updateForm.get('portada_oferta')!.setErrors(errors);
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
    // console.info('nombre:', formValue.nombre_oferta);
    // console.info('descripcion:', formValue.descripcion_oferta);
    // console.info('descuento:', formValue.descuento_oferta);
    // console.info('inicio:', formValue.inicio_oferta);
    // console.info('fin:', formValue.fin_oferta);
    // console.info('portada_oferta:', formValue.portada_oferta);
    // console.info('estado:', formValue.estado_oferta);
    // console.info('nivel:', formValue.nivel_oferta);
    // console.info('file:', this.selectedFile);

    const data: any = {};
    if (this.selectedFile) {
      data.portada_oferta = this.selectedFile;
    }
    if (!formValue.nombre_oferta) {
      data.nombre_oferta = this.nombre;
      data.estado_oferta = formValue.estado_oferta;
    } else {
      data.nombre_oferta = formValue.nombre_oferta;
      data.descripcion_oferta = formValue.descripcion_oferta;
      data.descuento_oferta = formValue.descuento_oferta;
      data.estado_oferta = formValue.estado_oferta;
      data.inicio_oferta = formValue.inicio_oferta;
      data.fin_oferta = formValue.fin_oferta;
      data.nivel_oferta = formValue.nivel_oferta;
    }


    // this.load_btn = true;
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
          this._router.navigate(['/panel/ofertas']);
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
    this._ofertaService.obtener_oferta_admin(this.id, this.token).subscribe(
      response => {
        this.load_data = false;
        if (response.data === undefined) {
          this._router.navigate(['/panel/ofertas']);
        } else {
          const { nombre_oferta, estado_oferta, descripcion_oferta, descuento_oferta, inicio_oferta, fin_oferta, portada_oferta, nivel_oferta, createdAt, updatedAt } = response.data;
          const formatteInicioOferta = this.convertDateFormat(inicio_oferta);
          const formattedFinOferta = this.convertDateFormat(fin_oferta);
          this.imageUrl = this.url + 'obtener_portada_oferta/' + portada_oferta;
          this.updateForm.patchValue({
            nombre_oferta: nombre_oferta,
            estado_oferta: estado_oferta,
            descripcion_oferta: descripcion_oferta,
            descuento_oferta: descuento_oferta,
            inicio_oferta: formatteInicioOferta,
            fin_oferta: formattedFinOferta,
            nivel_oferta: nivel_oferta,
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
    // Optionally, you can also reset the 'imageUrl' to the default image
    // this.imageUrl = 'assets/img/default.jpg';
  }

}

