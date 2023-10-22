import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AdminService } from "src/app/services/admin.service";
import { SubcategoriaService } from "src/app/services/subcategoria.service";
import { OfertaService } from 'src/app/services/oferta.service';
import { CategoriaService } from "src/app/services/categoria.service";


declare let iziToast: any;
declare let $: any;
@Component({
  selector: "app-create-subcategoria",
  templateUrl: "./create-subcategoria.component.html",
  styleUrls: ["./create-subcategoria.component.css"],
})
export class CreateSubcategoriaComponent implements OnInit {

  subcategoriaForm!: FormGroup;
  id = '';
  filtro = '';
  ofertas: any[] = [];
  categorias: any[] = [];
  config: { height: number };
  token: any;
  load_btn = false;
  load_data = false;

  constructor(
    private fb: FormBuilder,
    private _adminService: AdminService,
    private _subcategoriaService: SubcategoriaService,
    private _categoriaService: CategoriaService,
    private _ofertaService: OfertaService,
    private _router: Router,
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
      nombre_subcategoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      estado_subcategoria: [true, [Validators.required]],
      ofertas: [''],
      categoria: [''],

    });
    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      response => {
        this.ofertas = response.data;
        // console.log(this.oferta);
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
    this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
      response => {
        this.categorias = response.data;
        // console.log(this.categorias);
        this.categorias.forEach(element => {
          element.id = element._id;
          element.nombre_categoria = element.nombre_categoria;
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
    this.subcategoriaForm.patchValue({ ofertas: idOfertaSeleccionado });
  }

  onCategoriaSeleccionada(event: Event): void {
    const idOfertaSeleccionado = (event.target as HTMLSelectElement).value;
    // console.log(`ID de la oferta seleccionada: ${idOfertaSeleccionado}`);
    // Establecer el valor en el formulario
    this.subcategoriaForm.patchValue({ categoria: idOfertaSeleccionado });
  }

  subscribeToFormChanges(): void {
    this.subcategoriaForm.get("estado_subcategoria")!.valueChanges.subscribe((estado_subcategoriaValue) => {
      if (!estado_subcategoriaValue) {
        this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
      }
    });

  }

  get nombre_subcategoria() {
    return this.subcategoriaForm.get("nombre_subcategoria")!;
  }

  get estado_subcategoria() {
    return this.subcategoriaForm.get("estado_subcategoria")!;
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
    const filtro = formValue.nombre_subcategoria.toLowerCase();

    this._subcategoriaService.listar_subcategorias_admin(filtro, this.token).subscribe(
      (nombre_subcategorias) => {
        const nombre_subcategoriaBuscado = nombre_subcategorias.data.map((element: any) => element.nombre_subcategoria);
        if (nombre_subcategoriaBuscado.includes(filtro)) {
          // Set the repeatedTitleError on the nombre_subcategoria form control
          this.subcategoriaForm.controls['nombre_subcategoria'].setErrors({ 'repeatedTitleError': true });
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
                this.subcategoriaForm.controls['nombre_subcategoria'].setErrors({ 'repeatedTitleError': true });
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
      nombre_subcategoria: null,
      estado_subcategoria: true,
      categoria: null,
      ofertas: null,
    });

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