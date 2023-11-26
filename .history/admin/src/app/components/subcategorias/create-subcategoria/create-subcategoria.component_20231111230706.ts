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

  categorias: any[] = [];
  ofertas: any[] = [];



  ofertas_categorias: any[] = [];
  ofertas_subcategoria: any[] = [];
  ofertasAplicadas: any[] = [];
  ofertasDisponibles: any[] = [];
  ofertas_categoria: any[] = []; // Modify it to be an array of strings (offer IDs)
  selectedOffers: any[] = [];

  filtro = '';
  config: { height: number };
  token: any;
  load_btn = false;
  load_data = false;

  dropdownSettings = {
    singleSelection: false,
    idField: '_id',
    textField: 'nombre_oferta',
    selectAllText: 'Seleccionar todo',
    unSelectAllText: 'Anular la selección de todo',
    itemsShowLimit: 4, // Number of items to display in the dropdown before truncating
    allowSearchFilter: false, // Enable search functionality
    noDataAvailablePlaceholderText: 'sin ofertas disponibles',
  };

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
    // this.subscribeToFormChanges();
  }

  initializeForm(): void {
    this.subcategoriaForm = this.fb.group({
      nombre_subcategoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      estado_subcategoria: [{ value: true, disabled: true }, [Validators.required]],
      categoria_subcategoria: [null, [Validators.required]],
      ofertas_subcategoria: [''],
    });



    this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
      (categoriasResponse: any) => {
        this.categorias = categoriasResponse.data;
      },
      error => {
        console.log(error);
      }
    );

    this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
      (ofertasResponse: any) => {
        this.ofertasDisponibles = ofertasResponse.data;
        this.ofertasDisponibles = this.ofertasDisponibles.filter(oferta => {
          return oferta.nivel_oferta === "subcategorias";
        });
        console.log(this.ofertasDisponibles);
        // Create an array of applied offer IDs
        const appliedOfferIds = this.ofertasAplicadas
          .map(categoria => categoria.ofertas_categoria)
          .flat()
          .map(ofertaCategoria => ofertaCategoria._id);
        this.ofertasDisponibles = this.ofertasDisponibles.filter(oferta => {
          const gmtDate = new Date(oferta.fin_oferta); // Crear un objeto Date desde la fecha GTM
          const currentDate = new Date(); // Obtener la fecha actual
          return !appliedOfferIds.includes(oferta._id) && gmtDate > currentDate;
        });
        this.load_data = false;
      },
      (error) => {
        console.log(error);
      }
    );




    this._subcategoriaService.listar_subcategorias_admin(this.filtro, this.token).subscribe(
      (categoriasResponse: any) => {
        this.ofertas_subcategoria = categoriasResponse.data;
        console.log(this.ofertas_subcategoria);
        //     // console.log(this.categorias);
        //     // const ofertasAplicadasEnOtrasCategorias: any[] = categoriasResponse.data.map((categoria: any) => categoria.ofertas_categoria).flat();
        //     // this.ofertas = this.ofertas.filter((oferta: any) => !ofertasAplicadasEnOtrasCategorias.some((aplicada: any) => aplicada._id === oferta._id));
        //     // // console.log(ofertasAplicadasEnOtrasCategorias);
        //     // console.log(this.ofertas);
        //     const { nombre_categoria, icono_categoria, estado_categoria, ofertas_categoria, createdAt, updatedAt } = categoriasResponse.data;
        //     // this.ofertasAplicadas = categoriasResponse.data;
        //     // this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
        //     //   (ofertasResponse: any) => {
        //     //     this.ofertasDisponibles = ofertasResponse.data;
        //     //     // Create an array of applied offer IDs
        //     //     const appliedOfferIds = this.ofertasAplicadas
        //     //       .map(categoria => categoria.ofertas_categoria)
        //     //       .flat()
        //     //       .map(ofertaCategoria => ofertaCategoria._id);
        //     //     this.ofertasDisponibles = this.ofertasDisponibles.filter(oferta => {
        //     //       const gmtDate = new Date(oferta.fin_oferta); // Crear un objeto Date desde la fecha GTM
        //     //       const currentDate = new Date(); // Obtener la fecha actual
        //     //       return !appliedOfferIds.includes(oferta._id) && gmtDate > currentDate;
        //     //     });
        //     //     this.load_data = false;
        //     //   },
        //     //   (error) => {
        //     //     console.log(error);
        //     //   }
        //     // );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // onOfertaSeleccionada(event: Event): void {
  //   const idOfertaSeleccionado = (event.target as HTMLSelectElement).value;
  //   // console.log(`ID de la oferta seleccionada: ${idOfertaSeleccionado}`);
  //   // Establecer el valor en el formulario
  //   this.subcategoriaForm.patchValue({ ofertas_subcategoria: idOfertaSeleccionado });
  // }

  // subscribeToFormChanges(): void {
  //   this.subcategoriaForm.get("estado_subcategoria")!.valueChanges.subscribe((estado_subcategoriaValue) => {
  //     if (!estado_subcategoriaValue) {
  //       this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
  //     }
  //   });

  // }

  onCategoriaSeleccionada(event: Event): void {
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
    const selectedCategory = this.categorias.find(category => category._id === selectedCategoryId);
    if (selectedCategory) {
      this.ofertas_categoria = selectedCategory.ofertas_categoria;
      console.log(this.ofertas_categoria);


      this.subcategoriaForm.patchValue({
        ofertas_subcategoria: this.ofertas_subcategoria,
      });
    } else {
      this.ofertas_subcategoria = [];
      // Reset the offers when no category is selected
    }
  }

  get nombre_subcategoria() {
    return this.subcategoriaForm.get("nombre_subcategoria")!;
  }

  get categoria_subcategoria() {
    return this.subcategoriaForm.get("categoria_subcategoria")!;
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
    this.subcategoriaForm.reset({
      nombre_subcategoria: '',
      categoria_subcategoria: '',
      estado_subcategoria: true,
      ofertas_subcategoria: []
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