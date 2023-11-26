import { Component } from "@angular/core";
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
  load_data = false;
  config: { height: number };
  token = localStorage.getItem('token');
  load_btn = false;
  sanitizedSvgContent: SafeHtml | null = null;
  url = GLOBAL.url;

  ofertasAplicadas: any[] = [];
  ofertasDisponibles: any[] = [];
  ofertas: any[] = [];
  selectedOffers: any[] = [];
  dropdownSettings = {};
  private nombre: string = '';


  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _ofertaService: OfertaService,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.config = {
      height: 500,
    };
    this.token = this._adminService.getToken();
    this.updateForm = this.fb.group({
      nombre_categoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      icono_categoria: ['', [Validators.required, svgValidator()]],
      estado_categoria: [false],
      ofertas_categoria: this.fb.control({ value: '', disabled: false }),
      createdAt: [''],
      updatedAt: [''],
    });

  }


  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this.initializeForm();
      this.settings();
    });
    this.subscribeToFormChanges();
  }

  initializeForm() {
    // Obtén todas las ofertas disponibles
    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      (ofertasResponse: any) => {
        this.ofertasDisponibles = ofertasResponse.data;
        // Obtén las ofertas aplicadas en otras categorías
        this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
          (categoriasResponse: any) => {
            const ofertasAplicadasEnOtrasCategorias: any[] = categoriasResponse.data.map((categoria: any) => categoria.ofertas_categoria).flat();
            this.ofertasDisponibles = this.ofertasDisponibles.filter((oferta: any) => !ofertasAplicadasEnOtrasCategorias.some((aplicada: any) => aplicada._id === oferta._id));
            // Obtén las ofertas aplicadas en la categoria presente
            this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
              (response: any) => {
                this.load_data = false;
                if (response.data === undefined) {
                  this._router.navigate(['/panel/categorias']);
                } else {
                  const { nombre_categoria, icono_categoria, estado_categoria, ofertas_categoria, createdAt, updatedAt } = response.data;
                  this.ofertasAplicadas = response.data.ofertas_categoria;
                  this.ofertas = [...this.ofertasAplicadas, ...this.ofertasDisponibles];
                  this.nombre = nombre_categoria;
                  // console.log(estado_categoria);
                  this.updateForm.patchValue({
                    nombre_categoria: nombre_categoria,
                    icono_categoria: icono_categoria,
                    estado_categoria: estado_categoria,
                    ofertas_categoria: ofertas_categoria,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                  });

                }
              },
              (error) => {
                console.log(error);
                this._router.navigate(['/panel/categorias']);
              }
            );
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log(error);
      }
    );

  }

  settings() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'nombre_oferta',
      selectAllText: 'Seleccionar todo',
      unSelectAllText: 'Anular la selección de todo',
      itemsShowLimit: 4, // Number of items to display in the dropdown before truncating
      allowSearchFilter: false, // Enable search functionality
      noDataAvailablePlaceholderText: 'no existen ofertas disponibles',
    };
  }


  toggleDropdownState(): void {
    const ofertasCategoriaControl = this.updateForm.get('ofertas_categoria');

    // Check the value of estado_categoria control and disable/enable the ofertas_categoria control accordingly
    if (this.updateForm.get('estado_categoria')?.value) {
      ofertasCategoriaControl?.disable();
    } else {
      ofertasCategoriaControl?.enable();
    }
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
  get oferta_categoria() {
    return this.updateForm.get("ofertas_categoria")!;
  }


  convertDateFormat(originalDateString: string): string {
    const originalDate = new Date(originalDateString);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  subscribeToFormChanges(): void {
    this.updateForm.get('icono_categoria')?.valueChanges.subscribe((icono_categoria: string) => {
      this.sanitizedSvgContent = this.updateForm.get('icono_categoria')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono_categoria) : '';
    });

    const estado_categoriaControl = this.updateForm.get('estado_categoria');
    const nombre_categoriaControl = this.updateForm.get('nombre_categoria');
    const icono_categoriaControl = this.updateForm.get('icono_categoria');

    if (nombre_categoriaControl && estado_categoriaControl && icono_categoriaControl) {
      estado_categoriaControl.valueChanges.subscribe((ofertaValue) => {
        if (ofertaValue === false) {
          [nombre_categoriaControl, icono_categoriaControl].forEach(control => {
            control.disable({ onlySelf: true });
          });
        } else {

          [nombre_categoriaControl, icono_categoriaControl].forEach(control => {
            control.enable({ onlySelf: true });
          });
        }
      });
    }
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
    if (!Array.isArray(formValue.ofertas_categoria)) {
      formValue.ofertas_categoria = [];
    }

    const selectedOfferIds: string[] = formValue.ofertas_categoria.map((offer: { _id: string }) => offer._id);
    formValue.ofertas_categoria = selectedOfferIds;
    if (typeof formValue.ofertas_categoria === 'string') {
      formValue.ofertas_categoria = formValue.ofertas_categoria.split(',');
    }


    const data: any = {};

    if (!formValue.nombre_categoria) {
      data.nombre_categoria = this.nombre;
      data.estado_categoria = formValue.estado_categoria;
    } else {
      data.nombre_categoria = formValue.nombre_categoria;
      data.icono_categoria = formValue.icono_categoria;
      data.estado_categoria = formValue.estado_categoria;
      data.ofertas_categoria = formValue.ofertas_categoria;
    }

    this.load_btn = true;
    this._categoriaService.actualizar_categoria_admin(data, this.id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se actualizó correctamente el nuevo categoria.');
        this.load_btn = false;
        this._router.navigate(['/panel/categorias']);
      },
      error => {
        if (error.status === 409 && error.error.message === 'Ya existe una categoría con el mismo título.') {
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
    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      (ofertasResponse: any) => {
        this.ofertasDisponibles = ofertasResponse.data;
        // Obtén las ofertas aplicadas en otras categorías
        this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
          (categoriasResponse: any) => {
            const ofertasAplicadasEnOtrasCategorias: any[] = categoriasResponse.data.map((categoria: any) => categoria.ofertas_categoria).flat();
            this.ofertasDisponibles = this.ofertasDisponibles.filter((oferta: any) => !ofertasAplicadasEnOtrasCategorias.some((aplicada: any) => aplicada._id === oferta._id));
            // Obtén las ofertas aplicadas en la categoria presente
            this._categoriaService.obtener_categoria_admin(this.id, this.token).subscribe(
              (response: any) => {
                this.load_data = false;
                if (response.data === undefined) {
                  this._router.navigate(['/panel/categorias']);
                } else {
                  const { nombre_categoria, icono_categoria, estado_categoria, ofertas_categoria, createdAt, updatedAt } = response.data;
                  this.ofertasAplicadas = response.data.ofertas_categoria;
                  this.ofertas = [...this.ofertasAplicadas, ...this.ofertasDisponibles];
                  this.updateForm.patchValue({
                    nombre_categoria: nombre_categoria,
                    icono_categoria: icono_categoria,
                    estado_categoria: estado_categoria,
                    ofertas_categoria: ofertas_categoria,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                  });
                }
              },
              (error) => {
                console.log(error);
                this._router.navigate(['/panel/categorias']);
              }
            );
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

}



