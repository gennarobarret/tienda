import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { AdminService } from "src/app/services/admin.service";
import { SubcategoriaService } from "src/app/services/subcategoria.service";
import { OfertaService } from 'src/app/services/oferta.service';

declare let iziToast: any;
declare let $: any;
@Component({
  selector: "app-create-subcategoria",
  templateUrl: "./create-subcategoria.component.html",
  styleUrls: ["./create-subcategoria.component.css"],
})
export class CreateSubsubcategoriaComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  subcategoriaForm!: FormGroup;
  id = '';
  filtro = '';
  ofertas: any[] = [];
  config: { height: number };
  token: any;
  load_btn = false;
  load_data = false;

  sanitizedSvgContent: SafeHtml | null = null;


  constructor(
    private fb: FormBuilder,
    private _adminService: AdminService,
    private sanitizer: DomSanitizer,
    private _subcategoriaService: SubcategoriaService,
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
    this.subcategoriaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      icono: ['', [Validators.required, svgValidator()]],
      estado: [true, [Validators.required]],
      oferta: [''],

    });
    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      response => {
        this.ofertas = response.data;
        console.log(this.ofertas);
        this.ofertas.forEach(element => {
          element.id = element._id;
          element.nombre_oferta = element.nombre_oferta;

        });

        this.load_data = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  onOfertaSeleccionada(event: Event): void {
    const idOfertaSeleccionado = (event.target as HTMLSelectElement).value;
    // console.log(`ID de la oferta seleccionada: ${idOfertaSeleccionado}`);
    // Establecer el valor en el formulario
    this.subcategoriaForm.patchValue({ oferta: idOfertaSeleccionado });
  }


  subscribeToFormChanges(): void {

    this.subcategoriaForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
      if (!estadoValue) {
        this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
      }
    });
    this.subcategoriaForm.get('icono')?.valueChanges.subscribe((icono: string) => {
      this.sanitizedSvgContent = this.subcategoriaForm.get('icono')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono) : '';
    });

  }

  get titulo() {
    return this.subcategoriaForm.get("titulo")!;
  }

  get icono() {
    return this.subcategoriaForm.get("icono")!;
  }

  get estado() {
    return this.subcategoriaForm.get("estado")!;
  }



  public registro(): void {
    if (this.subcategoriaForm.invalid) {
      for (const control of Object.keys(this.subcategoriaForm.controls)) {
        this.subcategoriaForm.controls[control].markAsTouched();
      }
      this.load_btn = false;
      this.showErrorMessage("Hay errores en el formulario. Por favor, verifica los campos.");
      return;
    }
    const formValue = this.subcategoriaForm.value;
    console.log(formValue);
    // console.info('titulo:', formValue.titulo);
    // console.info('icono:', formValue.icono);
    // console.info('estado:', formValue.estado);
    // console.info('oferta:', formValue.oferta);
    // console.info('descuento_oferta:', formValue.descuento_oferta);
    // console.info('fin_oferta:', formValue.fin_oferta);
    // console.info('portada:', formValue.portada);
    // console.info('file:', this.selectedFile);

    const filtro = formValue.titulo.toLowerCase();
    this._subcategoriaService.listar_subcategorias_admin(filtro, this.token).subscribe(
      (titulos) => {
        const tituloBuscado = titulos.data.map((element: any) => element.titulo);
        if (tituloBuscado.includes(filtro)) {
          // Set the repeatedTitleError on the titulo form control
          this.subcategoriaForm.controls['titulo'].setErrors({ 'repeatedTitleError': true });
          this.showErrorMessage('listar Ya existe una categoría asociada a ese título en la base de datos');
          // Now the error message will be displayed in the template
          return;
        } else {
          this._subcategoriaService.registro_subcategoria_admin(formValue, this.token).subscribe(
            (response) => {

              this.showSuccessMessage('Se registró correctamente la categoría.');
              this.load_btn = true;
              this._router.navigate(['/panel/subcategorias']);

            },
            (error) => {
              if (error.status === 409 && error.error.message === 'Ya existe una categoría con el mismo título.') {
                this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                this.subcategoriaForm.controls['titulo'].setErrors({ 'repeatedTitleError': true });
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
    this.subcategoriaForm.patchValue({
      titulo: null,
      icono: null,
      estado: true,
      // oferta: false,
      // fin_oferta: null,
      // descuento_oferta: null,
      // portada: null, // or '' depending on what you want
    });
    // Disable the controls that need to be initially disabled
    // this.subcategoriaForm.get('descuento_oferta')?.disable({ onlySelf: true });
    // this.subcategoriaForm.get('fin_oferta')?.disable({ onlySelf: true });
    // this.subcategoriaForm.get('portada')?.disable({ onlySelf: true });
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