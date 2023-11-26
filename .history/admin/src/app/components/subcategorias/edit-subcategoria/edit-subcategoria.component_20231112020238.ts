import { Component } from "@angular/core";
import { AdminService } from "src/app/services/admin.service";
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { SubcategoriaService } from "src/app/services/subcategoria.service";
import { OfertaService } from 'src/app/services/oferta.service';
import { CategoriaService } from "src/app/services/categoria.service";


declare let iziToast: any;
declare let $: any;
@Component({
  selector: 'app-edit-subcategoria',
  templateUrl: './edit-subcategoria.component.html',
  styleUrls: ['./edit-subcategoria.component.css']
})
export class EditSubcategoriaComponent {

  updateForm!: FormGroup;

  id = '';
  filtro = '';
  load_data = false;
  config: { height: number };
  token = localStorage.getItem('token');
  load_btn = false;
  url = GLOBAL.url;
  categorias: any[] = [];
  ofertas: any[] = [];
  ofertasAplicadas: any[] = [];
  ofertasDisponibles: any[] = [];
  ofertas_subcategoria: any[] = [];
  selectedOffers: any[] = [];
  dropdownSettings = {};
  private nombre: string = '';


  constructor(
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _subcategoriaService: SubcategoriaService,
    private _ofertaService: OfertaService,
    private _router: Router,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.config = {
      height: 500,
    };
    this.token = this._adminService.getToken();
    this.updateForm = this.fb.group({
      nombre_subcategoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      estado_subcategoria: [{ value: true, disabled: true }, [Validators.required]],
      categoria_subcategoria: ['', [Validators.required]],
      ofertas_subcategoria: [''],
      createdAt: [''],
      updatedAt: [''],
    });

  }


  ngOnInit(): void {
    this.subscribeToFormChanges();
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this.initializeForm();
      this.settings();
    });
  }

  initializeForm() {
    // Obtén todas las ofertas disponibles
    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      (ofertasResponse: any) => {
        this.ofertasDisponibles = ofertasResponse.data;
        this.ofertasDisponibles = this.ofertasDisponibles.filter(oferta => {
          return oferta.nivel_oferta === "subcategoria";
        });
        // Obtén las ofertas aplicadas en otras categorías
        this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
          (categoriasResponse: any) => {
            this.categorias = categoriasResponse;
            const ofertasAplicadasEnOtrasCategorias: any[] = categoriasResponse.data.map((subcategoria: any) => subcategoria.ofertas_subcategoria).flat();
            this.ofertasDisponibles = this.ofertasDisponibles.filter((oferta: any) => !ofertasAplicadasEnOtrasCategorias.some((aplicada: any) => aplicada._id === oferta._id));
            // Obtén las ofertas aplicadas en la subcategoria presente
            this._subcategoriaService.obtener_subcategoria_admin(this.id, this.token).subscribe(
              (subcategoriasResponse: any) => {
                this.load_data = false;
                if (subcategoriasResponse.data === undefined) {
                  this._router.navigate(['/panel/categorias']);
                } else {
                  const { nombre_subcategoria, categoria_subcategoria, estado_subcategoria, ofertas_subcategoria, createdAt, updatedAt } = subcategoriasResponse.data;
                  console.log(categoria_subcategoria);
                  this.ofertasAplicadas = subcategoriasResponse.data.ofertas_subcategoria;
                  this.ofertas = [...this.ofertasAplicadas, ...this.ofertasDisponibles];
                  this.nombre = nombre_subcategoria;

                  this.updateForm.patchValue({
                    nombre_subcategoria: nombre_subcategoria,
                    categoria_subcategoria: categoria_subcategoria,
                    estado_subcategoria: estado_subcategoria,
                    ofertas_subcategoria: ofertas_subcategoria,
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

  onCategoriaSeleccionada(event: Event): void {
    // this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
    //   (ofertasResponse: any) => {
    //     const offer = ofertasResponse.data;
    //     this.ofertasDisponibles = offer.filter((oferta: any) => {
    //       return oferta.nivel_oferta === "subcategorias";
    //     });
    //     const appliedOfferIds = this.ofertasAplicadas
    //       .map(subcategoria => subcategoria.ofertas_subcategoria)
    //       .flat()
    //       .map(ofertaSubcategoria => ofertaSubcategoria._id);
    //     this.ofertasDisponibles = this.ofertasDisponibles.filter(oferta => {
    //       const gmtDate = new Date(oferta.fin_oferta);
    //       const currentDate = new Date();
    //       return !appliedOfferIds.includes(oferta._id) && gmtDate > currentDate;
    //     });
    //     const selectedCategoryId = (event.target as HTMLSelectElement).value;
    //     const selectedCategory = this.categorias.find(category => category._id === selectedCategoryId);
    //     if (selectedCategory) {
    //       this.ofertas_subcategoria = selectedCategory.ofertas_categoria;
    //       this.ofertas = [...this.ofertasDisponibles, ...selectedCategory.ofertas_categoria];
    //       console.log(this.ofertas);
    //       this.updateForm.patchValue({
    //         ofertas_subcategoria: this.ofertas_subcategoria,
    //       });
    //     } else {
    //       this.ofertas_subcategoria = [];

    //     }
    //     this.load_data = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );
  }


  get nombre_subcategoria() {
    return this.updateForm.get("nombre_subcategoria")!;
  }

  get categoria_subcategoria() {
    return this.updateForm.get("categoria_subcategoria")!;
  }

  get estado_subcategoria() {
    return this.updateForm.get("estado_subcategoria")!;
  }

  subscribeToFormChanges(): void {


    // const estado_subcategoriaControl = this.updateForm.get('estado_subcategoria');
    // const nombre_subcategoriaControl = this.updateForm.get('nombre_subcategoria');
    // const icono_subcategoriaControl = this.updateForm.get('icono_subcategoria');

    // if (nombre_subcategoriaControl && estado_subcategoriaControl && icono_subcategoriaControl) {
    //   estado_subcategoriaControl.valueChanges.subscribe((estadoValue) => {
    //     if (estadoValue === false) {
    //       [nombre_subcategoriaControl, icono_subcategoriaControl].forEach(control => {
    //         control.disable({ onlySelf: true });
    //       });
    //     } else {

    //       [nombre_subcategoriaControl, icono_subcategoriaControl].forEach(control => {
    //         control.enable({ onlySelf: true });
    //       });
    //     }
    //   });
    // }
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
    if (!Array.isArray(formValue.ofertas_subcategoria)) {
      formValue.ofertas_subcategoria = [];
    }

    const selectedOfferIds: string[] = formValue.ofertas_subcategoria.map((offer: { _id: string }) => offer._id);
    formValue.ofertas_subcategoria = selectedOfferIds;
    if (typeof formValue.ofertas_subcategoria === 'string') {
      formValue.ofertas_subcategoria = formValue.ofertas_subcategoria.split(',');
    }


    const data: any = {};

    if (!formValue.nombre_subcategoria) {
      data.nombre_subcategoria = this.nombre;
      data.estado_subcategoria = formValue.estado_subcategoria;
    } else {
      data.nombre_subcategoria = formValue.nombre_subcategoria;
      data.icono_subcategoria = formValue.icono_subcategoria;
      data.estado_subcategoria = formValue.estado_subcategoria;
      data.ofertas_subcategoria = formValue.ofertas_subcategoria;
    }

    this.load_btn = true;
    this._subcategoriaService.actualizar_subcategoria_admin(data, this.id, this.token).subscribe(
      response => {
        this.showSuccessMessage('Se actualizó correctamente el nuevo subcategoria.');
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
        this._subcategoriaService.listar_subcategorias_admin(this.filtro, this.token).subscribe(
          (categoriasResponse: any) => {
            const ofertasAplicadasEnOtrasCategorias: any[] = categoriasResponse.data.map((subcategoria: any) => subcategoria.ofertas_subcategoria).flat();
            this.ofertasDisponibles = this.ofertasDisponibles.filter((oferta: any) => !ofertasAplicadasEnOtrasCategorias.some((aplicada: any) => aplicada._id === oferta._id));
            // Obtén las ofertas aplicadas en la subcategoria presente
            this._subcategoriaService.obtener_subcategoria_admin(this.id, this.token).subscribe(
              (response: any) => {
                this.load_data = false;
                if (response.data === undefined) {
                  this._router.navigate(['/panel/categorias']);
                } else {
                  const { nombre_subcategoria, icono_subcategoria, estado_subcategoria, ofertas_subcategoria, createdAt, updatedAt } = response.data;
                  this.ofertasAplicadas = response.data.ofertas_subcategoria;
                  this.ofertas = [...this.ofertasAplicadas, ...this.ofertasDisponibles];
                  this.updateForm.patchValue({
                    nombre_subcategoria: nombre_subcategoria,
                    icono_subcategoria: icono_subcategoria,
                    estado_subcategoria: estado_subcategoria,
                    ofertas_subcategoria: ofertas_subcategoria,
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



