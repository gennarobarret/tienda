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

        this.ofertas_disponibles = [
            {
                "_id": "65271a77bda2a89543209228",
                "nombre_oferta": "oferta A",
                "descuento_oferta": 10,
                "descripcion_oferta": "oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A oferta A ",
                "inicio_oferta": "2023-10-12T00:00:00.000Z",
                "fin_oferta": "2023-10-31T00:00:00.000Z",
                "portada_oferta": "rFNaPRR4oy1mWfjyvKuYNmlu.jpg",
                "estado_oferta": true,
                "createdAt": "2023-10-11T21:58:15.275Z",
                "updatedAt": "2023-10-11T21:58:15.275Z",
                "__v": 0
            },
            {
                "_id": "6527f008bda2a89543209293",
                "nombre_oferta": "oferta B",
                "descuento_oferta": 50,
                "descripcion_oferta": "oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B oferta B ",
                "inicio_oferta": "2023-11-02T00:00:00.000Z",
                "fin_oferta": "2023-11-24T00:00:00.000Z",
                "portada_oferta": "p5pOYWmuugDqqEZTENHpf83A.jpg",
                "estado_oferta": true,
                "createdAt": "2023-10-12T13:09:29.285Z",
                "updatedAt": "2023-10-12T13:09:29.285Z",
                "__v": 0
            },
            {
                "_id": "6527f036bda2a89543209298",
                "nombre_oferta": "oferta C",
                "descuento_oferta": 20,
                "descripcion_oferta": " oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C  oferta C oferta C ",
                "inicio_oferta": "2023-11-09T00:00:00.000Z",
                "fin_oferta": "2023-12-07T00:00:00.000Z",
                "portada_oferta": "vfQKNrvZgOyjapPb9LX8tK_2.jpg",
                "estado_oferta": true,
                "createdAt": "2023-10-12T13:10:14.085Z",
                "updatedAt": "2023-10-12T13:10:14.085Z",
                "__v": 0
            },
            {
                "_id": "6527f06abda2a8954320929f",
                "nombre_oferta": "oferta D",
                "descuento_oferta": 60,
                "descripcion_oferta": " oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D oferta D ",
                "inicio_oferta": "2023-11-02T00:00:00.000Z",
                "fin_oferta": "2023-11-30T00:00:00.000Z",
                "portada_oferta": "b5OdWzvguLrsiwFJ9bLvo02H.jpg",
                "estado_oferta": true,
                "createdAt": "2023-10-12T13:11:06.654Z",
                "updatedAt": "2023-10-12T13:11:06.654Z",
                "__v": 0
            }
        ]

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
        const selectedOfertas = this.categoriaForm.get('ofertas_disponibles')?.value;
        console.log(selectedOfertas);
        const ofertasAplicadasControl = this.categoriaForm.get('ofertas_aplicadas');
        const ofertasDisponiblesControl = this.categoriaForm.get('ofertas_disponibles');

        if (selectedOfertas && ofertasAplicadasControl && ofertasDisponiblesControl) {
            // Add selected ofertas to Ofertas Aplicadas
            const ofertasAplicadas = ofertasAplicadasControl.value.concat(selectedOfertas);
            ofertasAplicadasControl.setValue(ofertasAplicadas);

            // Remove selected ofertas from Ofertas Disponibles
            const ofertasDisponibles = ofertasDisponiblesControl.value.filter((oferta: any) => !selectedOfertas.includes(oferta));
            ofertasDisponiblesControl.setValue(ofertasDisponibles);
        }
    }




    quitarOfertaAplicada(): void {
        const ofertasSeleccionadas = this.categoriaForm.get('ofertas_aplicadas')!.value;

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