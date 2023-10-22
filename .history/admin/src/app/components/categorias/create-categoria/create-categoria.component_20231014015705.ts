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
    ofertas: any[] = [];
    ofertasAplicadas: any[] = [];



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
            ofertasDisponibles: [[]],  // Cambio de nombre a "ofertasDisponibles"
            ofertasAplicadas: []      // Cambio de nombre a "ofertasAplicadas"
        });

        this._ofertaService.listar_ofertas_admin(this.filtro, this.token).subscribe(
            (response: any) => {
                this.ofertas = response.data;
                console.log(this.ofertas);
                this.load_data = false;
            },
            (error) => {
                console.log(error);
            }
        );
    }

    subscribeToFormChanges(): void {
        this.categoriaForm.get("estado_categoria")!.valueChanges.subscribe((estado_categoriaValue) => {
            if (!estado_categoriaValue) {
                this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.');
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

    // get ofertasDisponibles() {
    //     return this.categoriaForm.get("ofertasDisponibles")!;
    // }

    // get ofertasAplicadas() {
    //     return this.categoriaForm.get("ofertasAplicadas")!;
    // }

    selectAll() {
        const ofertasDisponibles = this.categoriaForm.get('ofertasDisponibles')?.value || [];
        console.log(ofertasDisponibles);
        this.categoriaForm.get('ofertasAplicadas')?.setValue([...(this.categoriaForm.get('ofertasAplicadas')?.value || []), ...ofertasDisponibles]);
        this.categoriaForm.get('ofertasDisponibles')?.setValue([]);
    }

    deselectAll() {
        const ofertasSeleccionadas = this.categoriaForm.get('ofertasDisponibles')?.value; const ofertasAplicadasControl = this.categoriaForm.get('ofertasAplicadas');

        // Mueve las ofertas seleccionadas de ofertasDisponibles a ofertasAplicadas
        for (const oferta of ofertasSeleccionadas) {
            const index = ofertasAplicadasControl.value.indexOf(oferta);
            if (index === -1) {
                ofertasAplicadasControl.setValue([...ofertasAplicadasControl.value, oferta]);
            }
        }

        // Elimina las ofertas seleccionadas de ofertasDisponibles
        ofertasAplicadasControl.value.forEach((oferta: any) => {
            const index = ofertasSeleccionadas.indexOf(oferta);
            if (index !== -1) {
                ofertasSeleccionadas.splice(index, 1);
            }
        }

    this.categoriaForm.get('ofertasDisponibles').setValue(ofertasSeleccionadas);
    }


    exchangeOffers() {
        const ofertasDisponibles = this.categoriaForm.get('ofertasDisponibles')?.value || [];
        const ofertasAplicadas = this.categoriaForm.get('ofertasAplicadas')?.value || [];

        // Move selected items from ofertasDisponibles to ofertasAplicadas
        this.categoriaForm.get('ofertasAplicadas')?.setValue([...ofertasAplicadas, ...ofertasDisponibles]);

        // Remove the selected items from ofertasDisponibles
        this.categoriaForm.get('ofertasDisponibles')?.setValue(ofertasDisponibles.filter((oferta: any) => !ofertasAplicadas.includes(oferta)));
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
        console.log(formValue);

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
