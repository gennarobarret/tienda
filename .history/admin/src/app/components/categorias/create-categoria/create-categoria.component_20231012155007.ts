import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { AdminService } from "src/app/services/admin.service";
import { CategoriaService } from "src/app/services/categoria.service";
import { OfertaService } from 'src/app/services/oferta.service';

declare let iziToast: any;
declare let $: any;
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
    ofertas_categoria: any[] = [];
    ofertas_disponibles: any[] = [];
    ofertas_aplicadas: any[] = [];


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
            ofertas_disponibles: ['', [Validators.required]],
            ofertas_aplicadas: ['', [Validators.required]],

        });
        this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
            response => {
                this.ofertas_disponibles = response.data;
                // this.ofertas_categoria.forEach(element => {
                //     element.id = element._id;
                //     element.nombre_oferta = element.nombre_oferta;
                //     element.estado_oferta = element.estado_oferta;
                // });
                this.load_data = false;
            },
            error => {
                console.log(error);
            }
        );
    }

    subscribeToFormChanges(): void {
        this.categoriaForm.get("estado_categoria")!.valueChanges.subscribe((estado_categoriaValue) => {
            if (!estado_categoriaValue) {
                this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
            }
        });
        this.categoriaForm.get('icono_categoria')?.valueChanges.subscribe((icono_categoria: string) => {
            this.sanitizedSvgContent = this.categoriaForm.get('icono_categoria')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono_categoria) : '';
        });
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

    agregarOfertaAplicada(): void {
        const ofertasSeleccionadas = this.categoriaForm.get('ofertas_disponibles')!.value;
        console.log(ofertasSeleccionadas);

        // // Iterate through the selected offers and move the first selected offer
        // for (const ofertaId of ofertasSeleccionadas) {
        //     const index = this.ofertas_disponibles.findIndex(o => o.id === ofertaId);
        //     if (index !== -1) {
        //         const oferta = this.ofertas_disponibles[index];
        //         this.ofertas_aplicadas.push(oferta);
        //         this.ofertas_disponibles.splice(index, 1);
        //         break; // Stop after moving the first selected offer
        //     }
        // }

        // Update the form controls and arrays
        // this.categoriaForm.patchValue({ ofertas_disponibles: this.ofertas_disponibles });
        this.categoriaForm.patchValue({ ofertas_aplicadas: this.ofertas_aplicadas });
    }




    quitarOfertaAplicada(): void {
        const ofertasSeleccionadas = this.categoriaForm.get('ofertas_aplicadas')!.value;

        // Create a copy of ofertas_disponibles
        const nuevasOfertasDisponibles = [...this.ofertas_disponibles];

        // Move the selected offers from aplicadas to disponibles
        for (const ofertaId of ofertasSeleccionadas) {
            const oferta = this.ofertas_aplicadas.find(o => o.id === ofertaId);
            if (oferta) {
                nuevasOfertasDisponibles.push(oferta);
            }
        }

        this.ofertas_disponibles = nuevasOfertasDisponibles;
        this.categoriaForm.patchValue({ ofertas_disponibles: this.ofertas_disponibles });
    }



    // onOfertaSeleccionada(event: Event): void {
    //     const idOfertaSeleccionado = (event.target as HTMLSelectElement).value;
    //     // console.log(`ID de la oferta seleccionada: ${idOfertaSeleccionado}`);
    //     // Establecer el valor en el formulario
    //     this.categoriaForm.patchValue({ ofertas_categoria: idOfertaSeleccionado });
    // }


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
        console.log(formValue);
        // console.info('nombre_categoria:', formValue.nombre_categoria);
        // console.info('icono_categoria:', formValue.icono_categoria);
        // console.info('estado_categoria:', formValue.estado_categoria);
        // console.info('oferta:', formValue.oferta);
        // console.info('descuento_oferta:', formValue.descuento_oferta);
        // console.info('fin_oferta:', formValue.fin_oferta);
        // console.info('portada:', formValue.portada);
        // console.info('file:', this.selectedFile);

        const filtro = formValue.nombre_categoria.toLowerCase();
        this._categoriaService.listar_categorias_admin(filtro, this.token).subscribe(
            (nombre_categorias) => {
                const nombre_categoriaBuscado = nombre_categorias.data.map((element: any) => element.nombre_categoria);
                if (nombre_categoriaBuscado.includes(filtro)) {
                    // Set the repeatedTitleError on the nombre_categoria form control
                    this.categoriaForm.controls['nombre_categoria'].setErrors({ 'repeatedTitleError': true });
                    this.showErrorMessage('listar Ya existe una categoría asociada a ese título en la base de datos');
                    // Now the error message will be displayed in the template
                    return;
                } else {
                    this._categoriaService.registro_categoria_admin(formValue, this.token).subscribe(
                        (response) => {

                            this.showSuccessMessage('Se registró correctamente la categoría.');
                            this.load_btn = true;
                            this._router.navigate(['/panel/categorias']);

                        },
                        (error) => {
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
        // Reset the 'portada' form control to null or an empty value
        this.categoriaForm.patchValue({
            nombre_categoria: null,
            icono_categoria: null,
            estado_categoria: true,

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