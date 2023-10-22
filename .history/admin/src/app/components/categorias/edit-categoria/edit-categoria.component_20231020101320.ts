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
  load_data = false;
  config: { height: number };
  token = localStorage.getItem('token');
  load_btn = false;
  sanitizedSvgContent: SafeHtml | null = null;
  url = GLOBAL.url;

  ofertasAplicadas: any[] = [];
  ofertas: any[] = [];
  ofertas_categoria: any[] = []; // Modify it to be an array of strings (offer IDs)
  selectedOffers: any[] = [];

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

          this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
            (categoriasResponse: any) => {
              this.ofertasAplicadas = categoriasResponse.data;
              this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
                (ofertasResponse: any) => {
                  this.ofertas = ofertasResponse.data;

                  console.log(this.ofertas);
                  //     const { nombre_oferta, estado_categoria_oferta, descripcion_oferta, descuento_oferta, inicio_oferta, fin_oferta, portada_oferta, createdAt, updatedAt } = response.data;
                  //     const formatteInicioOferta = this.convertDateFormat(inicio_oferta);
                  //     const formattedFinOferta = this.convertDateFormat(fin_oferta);
                  //     // this.imageUrl = this.url + 'obtener_portada_oferta/' + portada_oferta;
                  //     this.updateForm.patchValue({
                  //       oferta: nombre_oferta,
                  //       // estado_categoria_oferta: estado_categoria_oferta,
                  //       // descripcion_oferta: descripcion_oferta,
                  //       // descuento_oferta: descuento_oferta,
                  //       // inicio_oferta: formatteInicioOferta,
                  //       // fin_oferta: formattedFinOferta,
                  //       // createdAt: createdAt,
                  //       // updatedAt: updatedAt
                  //     });
                  // Create an array of applied offer IDs
                  const appliedOfferIds = this.ofertasAplicadas
                    .map(categoria => categoria.ofertas_categoria)
                    .flat()
                    .map(ofertaCategoria => ofertaCategoria._id);
                  this.ofertas = this.ofertas.filter(oferta => !appliedOfferIds.includes(oferta._id));
                  this.load_data = false;
                },
                (error) => {
                  console.log(error);
                }
              );
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
    console.log(formValue);
    // console.info('nombre_categoria:', formValue.nombre_categoria);
    // console.info('icono_categoria:', formValue.icono_categoria);
    // console.info('estado_categoria:', formValue.estado_categoria);
    // console.info('oferta:', formValue.oferta);
    // console.info('descuento_oferta:', formValue.descuento_oferta);
    // console.info('fin_oferta:', formValue.fin_oferta);
    // console.info('portada:', formValue.portada);
    // console.info('file:', this.selectedFile);

    const data: any = {};

    data.nombre_categoria = formValue.nombre_categoria;
    data.icono_categoria = formValue.icono_categoria;
    data.estado_categoria = formValue.estado_categoria;
    data.ofertas_categoria = formValue.ofertas_categoria;


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

    });
  }

}

