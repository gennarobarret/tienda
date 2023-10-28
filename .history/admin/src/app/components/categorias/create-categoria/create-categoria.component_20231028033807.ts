import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { AdminService } from "src/app/services/admin.service";
import { CategoriaService } from "src/app/services/categoria.service";
import { OfertaService } from 'src/app/services/oferta.service';

declare let iziToast: any;

@Component({
    selector: "app-create-categoria",
    templateUrl: "./create-categoria.component.html",
    styleUrls: ["./create-categoria.component.css"],
})
export class CreateCategoriaComponent implements OnInit {
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

    categoriaForm!: FormGroup;
    id = '';
    filtro = '';
    config: { height: number };
    token: any;
    load_btn = false;
    load_data = false;
    sanitizedSvgContent: SafeHtml | null = null;
    ofertasAplicadas: any[] = [];
    ofertasDisponibles: any[] = [];
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
        noDataAvailablePlaceholderText: 'sin ofertas disponibles',
    };

    constructor(
        private fb: FormBuilder,
        private _adminService: AdminService,
        private sanitizer: DomSanitizer,
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
        this.categoriaForm = this.fb.group({
            nombre_categoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
            icono_categoria: ['', [Validators.required, svgValidator()]],
            estado_categoria: [true, [Validators.required]],
            ofertas_categoria: ['', []]
        });

        this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
            (categoriasResponse: any) => {
                this.ofertasAplicadas = categoriasResponse.data;
                this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
                    (ofertasResponse: any) => {
                        this.ofertasDisponibles = ofertasResponse.data;

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
            },
            error => {
                console.log(error);
            }
        );

    }


    get nombre_categoria() {
        return this.categoriaForm.get("nombre_categoria")!;
    }

    get icono_categoria() {
        return this.categoriaForm.get("icono_categoria")!;
    }

    get estado_categoria() {
        return this.categoriaForm.get("estado_categoria")!;
    }

    subscribeToFormChanges(): void {
        this.categoriaForm.get("estado_categoria")!.valueChanges.subscribe((estado_categoriaValue) => {
            if (!estado_categoriaValue) {
                this.showWarningMessage('Esta categoría está actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.');
            }
        });

        this.categoriaForm.get('icono_categoria')?.valueChanges.subscribe((icono_categoria: string) => {
            this.sanitizedSvgContent = this.categoriaForm.get('icono_categoria')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono_categoria) : '';
        });
    }

    public registro(): void {
        if (this.categoriaForm.invalid) {
            for (const control of Object.keys(this.categoriaForm.controls)) {
                this.categoriaForm.controls[control].markAsTouched();
            }
            this.load_btn = false;
            this.showErrorMessage("Hay errores en el formulario. Por favor, verifica los campos.");
            return;
        }

        const formValue = this.categoriaForm.value;
        // console.log(formValue);
        if (!Array.isArray(formValue.ofertas_categoria)) {
            formValue.ofertas_categoria = []; // Convierte a un array vacío si no es un array
        }
        const selectedOfferIds: string[] = formValue.ofertas_categoria.map((offer: { _id: string }) => offer._id);
        formValue.ofertas_categoria = selectedOfferIds;
        if (typeof formValue.ofertas_categoria === 'string') {
            formValue.ofertas_categoria = formValue.ofertas_categoria.split(',');
        }
        const filtro = formValue.nombre_categoria.toLowerCase();
        this._categoriaService.listar_categorias_admin(filtro, this.token).subscribe(
            (nombre_categorias: any) => {
                const nombre_categoriaBuscado = nombre_categorias.data.map((element: any) => element.nombre_categoria);
                if (nombre_categoriaBuscado.includes(filtro)) {
                    // Set the repeatedTitleError on the nombre_categoria form control
                    this.categoriaForm.controls['nombre_categoria'].setErrors({ 'repeatedTitleError': true });
                    this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                    // Now the error message will be displayed in the template
                    return;
                } else {
                    this._categoriaService.registro_categoria_admin(formValue, this.token).subscribe(
                        (response) => {
                            this.showSuccessMessage('Se registró correctamente la categoría.');
                            this.load_btn = true;
                            this._router.navigate(['/panel/categorias']);
                        },
                        (error: any) => {
                            if (error.status === 409 && error.error.message === 'Ya existe una categoría con el mismo título.') {
                                this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                                this.categoriaForm.controls['nombre_categoria'].setErrors({ 'repeatedTitleError': true });
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
        this.categoriaForm = this.fb.group({
            nombre_categoria: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
            icono_categoria: ['', [Validators.required, svgValidator()]],
            estado_categoria: [true, [Validators.required]],
            ofertas_categoria: ['', []] // Re-add the ofertas_categoria control here
        });
        this.unselectAllOfertas();
    }

    unselectAllOfertas(): void {
        this.categoriaForm.get('ofertas_categoria')?.setValue([]); // Set an empty array to clear all selections
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
