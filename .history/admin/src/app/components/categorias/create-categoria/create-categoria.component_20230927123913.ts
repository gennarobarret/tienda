import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { AdminService } from "src/app/services/admin.service";
import { CategoriaService } from "src/app/services/categoria.service";

declare let iziToast: any;
declare let $: any;
@Component({
    selector: "app-create-categoria",
    templateUrl: "./create-categoria.component.html",
    styleUrls: ["./create-categoria.component.css"],
})
export class CreateCategoriaComponent implements OnInit {
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('descuentoInput') descuentoInput!: ElementRef;
    @ViewChild('fechaInput') fechaInput!: ElementRef;
    @ViewChild('portadaInput') portadaInput!: ElementRef;

    categoriaForm!: FormGroup;

    config: { height: number };
    token: any;
    load_btn = false;
    imageUrl: any | ArrayBuffer = 'assets/img/default.jpg';
    sanitizedSvgContent: SafeHtml | null = null;
    selectedFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private _adminService: AdminService,
        private sanitizer: DomSanitizer,
        private _categoriaService: CategoriaService,
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
        this.categoriaForm = this.fb.group({
            titulo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
            icono: ['', [Validators.required, svgValidator()]],
            estado: [true, [Validators.required]],
            oferta: [false, [Validators.required]],
            descuento_oferta: [{ value: null, disabled: true }, [Validators.required, this.validateDiscountRange.bind(this)]],
            fin_oferta: [{ value: '', disabled: true }, [Validators.required, this.validateOfertDate.bind(this)]],
            portada: [{ value: null, disabled: true }, [Validators.required]],
        });
    }

    subscribeToFormChanges(): void {
        this.categoriaForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
            if (!estadoValue) {
                this.showWarningMessage('Esta categoría esta actualmente desactivada, será creada pero solo será visible para los administradores de la tienda online.')
            }
        });
        this.categoriaForm.get('icono')?.valueChanges.subscribe((icono: string) => {
            this.sanitizedSvgContent = this.categoriaForm.get('icono')?.valid ? this.sanitizer.bypassSecurityTrustHtml(icono) : '';
        });

        const ofertaControl = this.categoriaForm.get('oferta');
        const descuentoOfertaControl = this.categoriaForm.get('descuento_oferta');
        const fechaOfertaControl = this.categoriaForm.get('fin_oferta');
        const portadaControl = this.categoriaForm.get('portada');

        if (ofertaControl && descuentoOfertaControl && fechaOfertaControl && portadaControl) {

            ofertaControl.valueChanges.subscribe((ofertaValue) => {
                const isOfertaFalse = ofertaValue === false;

                if (isOfertaFalse) {
                    this.descuentoInput.nativeElement.readOnly = true;
                    this.fechaInput.nativeElement.readOnly = true;
                    this.portadaInput.nativeElement.readOnly = true;
                } else {
                    this.descuentoInput.nativeElement.readOnly = false;
                    this.fechaInput.nativeElement.readOnly = false;
                    this.portadaInput.nativeElement.readOnly = false;
                }
            });



            // ofertaControl.valueChanges.subscribe((ofertaValue) => {
            //     if (ofertaValue === false) {
            //         // this.imageUrl = 'assets/img/default.jpg';
            //         // this.selectedFile = null;
            //         [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
            //             control.disable({ onlySelf: true });
            //         });
            //     } else {
            //         [descuentoOfertaControl, fechaOfertaControl, portadaControl].forEach(control => {
            //             control.enable({ onlySelf: true });
            //         });
            //     }
            // });
        }

    }

    get titulo() {
        return this.categoriaForm.get("titulo")!;
    }

    get icono() {
        return this.categoriaForm.get("icono")!;
    }

    get estado() {
        return this.categoriaForm.get("estado")!;
    }

    get oferta() {
        return this.categoriaForm.get("oferta")!;
    }

    get descuento_oferta() {
        return this.categoriaForm.get("descuento_oferta")!;
    }

    get fin_oferta() {
        return this.categoriaForm.get("fin_oferta")!;
    }

    get portada() {
        return this.categoriaForm.get("portada")!;
    }


    limitInputLength(event: any) {
        const inputValue = event.target.value;

        if (inputValue.length > 3) {
            event.target.value = inputValue.slice(0, 3);
        }

        // Realiza una verificación de nulidad antes de acceder a numberInput
        const numberInput = this.categoriaForm.get("descuento_oferta");
        if (numberInput !== null && numberInput.value < 0) {
            numberInput.setValue(0);
        }
        if (numberInput !== null && numberInput.value > 100) {
            numberInput.setValue(100);
        }
    }

    restrictInput(event: any) {
        const charCode = event.charCode;
        const inputValue = (event.target as HTMLInputElement).value;
        const currentValue = parseInt(inputValue, 10); // Convierte el valor a un número entero

        // Verifica si el nuevo valor sería menor que 0 o mayor que 100
        if (charCode === 45 && currentValue === 0) {
            // Evita la entrada de "-" cuando el valor es 0
            event.preventDefault();
            return;
        } else if (currentValue === -1 || (currentValue === 100 && charCode !== 46)) {
            // Evita la entrada de "-1" o "100" (excepto el punto decimal para 100.0)
            event.preventDefault();
            return;
        }

        if (charCode < 48 || charCode > 57) {
            // Evita la entrada de caracteres no numéricos
            event.preventDefault();
            return;
        }
    }


    private validateDiscountRange(control: FormControl): { [key: string]: any } | null {
        const descuentoControl = control.value;
        // Check if descuentoControl is null or undefined
        // console.log(descuentoControl);
        if (descuentoControl == null) {
            return null//Or return an appropriate validation result if needed
        }
        if (descuentoControl === 0) {
            this.showErrorMessage('El descuento de la oferta de la categoria no puede ser cero');
            return { 'invalidDiscount': true };
        }
        // const descuentoString: string = descuentoControl.toString();
        // if (descuentoString === '0') {
        //     this.showErrorMessage('El descuento de la oferta de la categoria no puede ser cero');
        //     return { 'invalidDiscount': true };
        // }

        return null;
    }


    private validateOfertDate(control: FormControl): { [key: string]: any } | null {
        const inputDateStr: string = control.value;
        const currentDate = new Date();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(inputDateStr)) {
            return { 'invalidDate': true };
        }

        const finOfertaDateControl: Date = new Date(inputDateStr);

        if (isNaN(finOfertaDateControl.getTime())) {
            this.showErrorMessage('La fecha introducida no es válida.');
            return { 'invalidDate': true };
        }

        if (finOfertaDateControl <= currentDate) {
            this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
            return { 'invalidDate': true };
        }

        return null;
    }

    fileChangeEvent(event: Event): void {
        const inputElement = event.target as HTMLInputElement;

        if (inputElement.files && inputElement.files.length > 0) {
            this.selectedFile = inputElement.files[0];
            this.validateAndUpdatePortada(this.selectedFile);
        }
    }

    private validateAndUpdatePortada(file: File) {
        const errors = this.validateFileUpdate(file);
        if (errors) {
            this.categoriaForm.get('portada')!.setErrors(errors);
        }
    }

    private validateFileUpdate(file: File): { [key: string]: any } | null {
        if (file) {
            const validTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];
            if (validTypes.includes(file.type)) {
                if (file.size <= 4000000) {
                    let reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onload = () => {
                        if (reader.result !== null) {
                            this.imageUrl = reader.result as string;
                            this.categoriaForm.patchValue({
                                file: reader.result
                            });
                        }
                    }

                    this.cd.markForCheck();
                    return null;
                } else {
                    // console.log('La imagen no puede superar los 4MB');
                    this.showErrorMessage('La imagen no puede superar los 4MB');
                    return { invalidFileSize: true };
                }
            } else {
                // console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
                this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
                return { invalidFileType: true };
            }
        }

        return null;
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

        // Habilita los controles que deben estar habilitados para el envío
        // this.categoriaForm.get('descuento_oferta')?.enable({ onlySelf: true });
        // this.categoriaForm.get('fin_oferta')?.enable({ onlySelf: true });
        // this.categoriaForm.get('portada')?.enable({ onlySelf: true });

        const formValue = this.categoriaForm.value;
        console.info('titulo:', formValue.titulo);
        console.info('icono:', formValue.icono);
        console.info('estado:', formValue.estado);
        console.info('oferta:', formValue.oferta);
        console.info('descuento_oferta:', formValue.descuento_oferta);
        console.info('fin_oferta:', formValue.fin_oferta);
        console.info('portada:', formValue.portada);
        console.info('file:', this.selectedFile);

        const filtro = formValue.titulo.toLowerCase();
        this._categoriaService.listar_categorias_admin(filtro, this.token).subscribe(
            (titulos) => {
                const tituloBuscado = titulos.data.map((element: any) => element.titulo);
                if (tituloBuscado.includes(filtro)) {
                    // Establece el error repeatedTitleError en el control de formulario titulo
                    this.categoriaForm.controls['titulo'].setErrors({ 'repeatedTitleError': true });
                    this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                    // Ahora se mostrará el mensaje de error en el template
                    return;
                } else {
                    this._categoriaService.registro_categoria_admin(formValue, this.selectedFile, this.token).subscribe(
                        (response) => {
                            this.showSuccessMessage('Se registró correctamente la categoría.');
                            this.load_btn = true;
                            this._router.navigate(['/panel/categorias']);
                        },
                        (error) => {
                            if (error.status === 409 && error.error.message === 'Ya existe una categoría con el mismo título.') {
                                this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                                this.categoriaForm.controls['titulo'].setErrors({ 'repeatedTitleError': true });
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

        // Después de enviar el formulario, deshabilita nuevamente los controles si oferta es false
        if (!formValue.oferta) {
            this.categoriaForm.get('descuento_oferta')?.disable({ onlySelf: true });
            this.categoriaForm.get('fin_oferta')?.disable({ onlySelf: true });
            this.categoriaForm.get('portada')?.disable({ onlySelf: true });
        }
    }


    resetForm(): void {
        // Reset the 'portada' form control to null or an empty value
        this.categoriaForm.patchValue({
            titulo: null,
            icono: null,
            estado: true,
            oferta: false,
            fin_oferta: null,
            descuento_oferta: null,
            portada: null, // or '' depending on what you want
        });
        // Disable the controls that need to be initially disabled
        this.categoriaForm.get('descuento_oferta')?.disable({ onlySelf: true });
        this.categoriaForm.get('fin_oferta')?.disable({ onlySelf: true });
        this.categoriaForm.get('portada')?.disable({ onlySelf: true });
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