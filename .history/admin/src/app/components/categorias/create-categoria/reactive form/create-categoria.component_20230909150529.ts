import { Component, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";
import { CategoriaService } from "src/app/services/categoria.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import DOMPurify from "dompurify";
import { Router } from "@angular/router";


declare let iziToast: any;
declare let $: any;

interface categoria {
    titulo: string;
    icono: string;
    estado: boolean;
    oferta: boolean;
    descuento_oferta: number;
    fin_oferta: string;
    portada: string;
}

@Component({
    selector: "app-create-categoria",
    templateUrl: "./create-categoria.component.html",
    styleUrls: ["./create-categoria.component.css"],
})



export class CreateCategoriaComponent {

    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

    categoriaForm!: FormGroup;
    // categoria: categoria;
    config: { height: number };
    token;
    trustedSvg: SafeHtml | null = null;
    load_btn = false;
    imageUrl: any = 'assets/img/default.jpg';
    editFile: boolean = true;
    removeUpload: boolean = false;
    file: any = undefined;

    // Define las etiquetas permitidas
    private allowedTags: string[] = ["svg", "circle", "polygon", "path", "text"];
    // Define los atributos cada etiqueta permitida
    private allowedAttributes: { [key: string]: string[] } = {
        svg: ["xmlns", "viewBox", "height", "width", "fill", "class"],
        circle: ["cx", "cy", "r"],
        polygon: ["points"],
        path: ["d", "fill-rule", "id", "class", "clip-path", "mask", "filter", "vector-effect", "pathLength"],
        text: ["x", "y", "text-anchor", "font-family", "font-size", "text-align"]
    };
    // Define los patrones regex para cada atributo
    private validAttributes: { [key: string]: RegExp } = {
        xmlns: /^(https?:\/\/[^\s]+)|\s*$/,  // Acepta una URL o una cadena vacía.
        viewBox: /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/,  // Acepta coordenadas de vista.
        height: /^[\d.]+(px|%|em|rem|vh|vw)?$/,  // Acepta altura con unidades opcionales.
        width: /^[\d.]+(px|%|em|rem|vh|vw)?$/,  // Acepta ancho con unidades opcionales.
        fill: /^([a-zA-Z]+|#\w{3,6}|(rgb|hsl)a?\([\d\s%,.]+\))$/,  // Acepta color o gradiente.
        class: /^[a-zA-Z_][a-zA-Z0-9_ -]*$/,  // Acepta nombres de clase con letras, números, guiones bajos, guiones y espacios.
        cx: /^-?\d+(\.\d+)?$/,  // Acepta coordenada x opcional.
        cy: /^-?\d+(\.\d+)?$/,  // Acepta coordenada y opcional.
        r: /^\d+(\.\d+)?$/,  // Acepta radio del círculo.
        points: /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?(?:\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?)*$/,  // Acepta coordenadas de puntos.
        d: /^[MmLlHhVvCcSsQqTtAaZz0-9\s,]+$/,  // Acepta comandos del trazado SVG.
        'fill-rule': /^(evenodd|nonzero)$/,  // Acepta una regla de llenado.
        id: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta identificadores con letras, números y guiones bajos.
        clipPath: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de clipPath con letras, números y guiones bajos.
        mask: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de máscara con letras, números y guiones bajos.
        filter: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de filtro con letras, números y guiones bajos.
        'vector-effect': /^(none|non-scaling-stroke)$/,  // Acepta un efecto de vector.
        pathLength: /^\d+(\.\d+)?$/,  // Acepta longitud del trazado.
        x: /^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)?$/,  // Acepta coordenada x con unidades opcionales.
        y: /^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)?$/,  // Acepta coordenada y con unidades opcionales.
        'text-anchor': /^(start|middle|end)$/,  // Acepta un anclaje de texto.
        'font-family': /^[a-zA-Z\s,"']+$/,  // Acepta una familia de fuente.
        'font-size': /^[\d.]+(px|%|em|rem)$/,  // Acepta un tamaño de fuente con unidades opcionales.
        'text-align': /^(left|center|right|justify)$/,  // Acepta una alineación de texto.
    };

    requiredForm: FormGroup = new FormGroup(
        {
            from: new FormControl(""),
            to: new FormControl(""),
        },
        Validators.required
    );

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
        // this.categoria = {
        //     titulo: "",
        //     icono: "",
        //     estado: true,
        //     oferta: true,
        //     fin_oferta: "",
        //     portada: ""
        // } as categoria;
    }

    ngOnInit(): void {
        this.categoriaForm = this.fb.group({
            titulo: [
                null,
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(25),
                    Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$"),
                ],
            ],
            icono: [null, [Validators.required, this.validateSVGIcon.bind(this)]],
            estado: [true, [Validators.required]],
            oferta: [true, [Validators.required]],
            descuento_oferta: [null, [Validators.required]],
            fin_oferta: [null, [Validators.required, this.validateOfertDate.bind(this)]],
            portada: [null, [Validators.required]],
            file: [null],
            addDynamicElement: this.fb.array([])
        });


        // Check if categoriaForm is defined before accessing its controls
        if (this.categoriaForm) {
            const ofertaControl = this.categoriaForm.get('oferta');
            const descuentoOfertaControl = this.categoriaForm.get('descuento_oferta');
            const fechaOfertaControl = this.categoriaForm.get('fin_oferta');
            const portadaControl = this.categoriaForm.get('portada');
            // Check if ofertaControl and descuentoOfertaControl are defined
            if (ofertaControl && descuentoOfertaControl && fechaOfertaControl && portadaControl) {
                // Subscribe to the valueChanges of the 'estado' form control
                ofertaControl.valueChanges.subscribe((ofertaValue) => {
                    // console.log("Oferta Checkbox Value:", ofertaValue);
                    // Check and disable descuento_oferta based on ofertaValue
                    if (ofertaValue === false) {
                        descuentoOfertaControl.disable({ onlySelf: true });
                        fechaOfertaControl.disable({ onlySelf: true });
                        portadaControl.disable({ onlySelf: true });
                    } else {
                        descuentoOfertaControl.enable({ onlySelf: true });
                        fechaOfertaControl.enable({ onlySelf: true });
                        portadaControl.enable({ onlySelf: true });
                    }
                });

            }
        }

        // Subscribe to the valueChanges of the 'estado' form control
        this.categoriaForm.get("estado")!.valueChanges.subscribe((estadoValue) => {
            // console.log("Estado Checkbox Value:", estadoValue);
            if (!estadoValue) {
                $("#categoryAlertModal").modal("show");
            }
        });

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

    showErrorMessage(message: string) {
        iziToast.show({
            title: "ERROR",
            titleColor: "#FF0000",
            color: "#FFF",
            class: "text-danger",
            position: "topRight",
            message: message,
        });
    }

    restrictInput(event: any) {
        const charCode = event.charCode;
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    }

    limitInputLength(event: any) {
        const inputValue = event.target.value;

        // Verificar si el valor es igual a 0 y no está vacío
        if (inputValue === '0' && inputValue !== '') {
            // Puedes tomar acciones aquí, como mostrar un mensaje de error o deshabilitar el botón de envío.
            // En este ejemplo, simplemente estableceremos el valor del campo a un valor predeterminado (por ejemplo, 1).
            event.target.value = '1'; // Cambia "1" al valor predeterminado que desees.
        }

        if (inputValue.length > 3) {
            event.target.value = inputValue.slice(0, 3);
        }
        const descuentoControl = this.categoriaForm.get("descuento_oferta");
        if (descuentoControl) {
            const descuentoValue = descuentoControl.value;
            if (descuentoValue > 100) {
                descuentoControl.setValue(100); // Set the value to 100 if it's greater than 100.
            } else if (descuentoValue < 0) {
                descuentoControl.setValue(0); // Set the value to 0 if it's less than 0.
            }
        }
    }

    showSuccessMessage(message: string) {
        iziToast.show({
            title: "SUCCESS",
            titleColor: "#1DC74C",
            color: "#FFF",
            class: "text-success",
            position: "topRight",
            message: message,
        });
    }

    private sanitizeSvg(svgCode: string): SafeHtml | null {
        try {
            const sanitizedSvg: string = DOMPurify.sanitize(svgCode, {
                ADD_TAGS: this.allowedTags as any,
                ADD_ATTR: this.allowedAttributes as any,
                WHOLE_DOCUMENT: true,
            });

            return this.sanitizer.bypassSecurityTrustHtml(sanitizedSvg);
        } catch (error) {
            // Handle the error here, e.g., log it or perform any necessary actions.
            console.error('Error while sanitizing SVG:', error);
            return null; // Return null or some default value in case of an error.
        }
    }

    private validateSVGIcon(control: FormControl): { [key: string]: any } | null {
        // Obtiene el código SVG del control.
        const svgCode: string = control.value;

        // Verifica q exita el svg.
        if (svgCode) {
            // Verifica la presencia de elementos o atributos potencialmente maliciosos.
            if (
                svgCode.includes("<script") ||
                svgCode.includes("javascript:") ||
                svgCode.includes("data:") ||
                svgCode.includes("<iframe") ||
                svgCode.includes("<img") ||
                svgCode.includes("<a")
            ) {
                this.showErrorMessage('El SVG contiene atributos o valores maliciosos.');
                this.trustedSvg = '';
                return { invalidSVG: true };
            }

            // Analiza el código SVG utilizando un parser XML.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(svgCode, "text/xml");
            const svgElement = xmlDoc.querySelector("svg");


            // Verifica la existencia de un elemento "svg" válido.
            if (!svgElement) {
                this.showErrorMessage('No se encontró un elemento "svg" válido en el SVG proporcionado.');
                this.trustedSvg = '';
                return { invalidSVG: true };
            }

            // Verifica si el código SVG termina correctamente con "</svg>".
            if (!svgCode.endsWith("</svg>")) {
                this.showErrorMessage('Falta el cierre de la etiqueta "</svg>" en el SVG proporcionado.');
                this.trustedSvg = '';
                return { invalidSVG: true };
            }

            // Verifica la etiqueta de cierre "/>" en los elementos "<path>".
            const pathElements = svgCode.match(/<path[^>]*>/g);
            if (pathElements) {
                for (const pathElement of pathElements) {
                    if (!pathElement.endsWith("/>")) {
                        this.showErrorMessage('Falta la etiqueta de cierre "/>" en un elemento "<path>" en el SVG proporcionado.');
                        this.trustedSvg = '';
                        return { invalidSVG: true };
                    }
                }
            }

            // Obtiene las etiquetas y atributos del elemento "svg".
            const svgTags: string[] = Array.from(svgElement.children).map((el) => el.tagName);
            const svgAttributes: string[] = Array.from(svgElement.attributes).map((attr) => attr.name);

            // Valida los atributos del elemento "svg".
            const svgValidAttributes: Attr[] = Array.from(svgElement.attributes);
            for (const attr of svgValidAttributes) {
                const attributeName = attr.name;
                const attributeValue = attr.value;

                if (this.validAttributes.hasOwnProperty(attributeName)) {
                    const attributePattern = this.validAttributes[attributeName];
                    if (!attributePattern.test(attributeValue)) {
                        const errorMessage = `El atributo "${attributeName}" contiene caracteres no permitidos: "${attributeValue}"`;
                        this.showErrorMessage(errorMessage);
                        this.trustedSvg = '';
                        return { [`${attributeName}Invalid`]: true };
                    }
                }
            }

            // Verifica las etiquetas no permitidas en el SVG.
            const invalidTags = svgTags.filter((tag) => !this.allowedTags.includes(tag));
            if (invalidTags.length > 0) {
                const errorMessage = `Etiquetas no permitidas en el SVG: ${invalidTags.join(", ")}`;
                this.showErrorMessage(errorMessage);
                this.trustedSvg = '';
                return { invalidSVG: true };
            }

            // Verifica los atributos no permitidos en el elemento "svg".
            const invalidAttributes = svgAttributes.filter(
                (attr) => !this.allowedAttributes[svgElement.tagName].includes(attr)
            );

            if (invalidAttributes.length > 0) {
                const errorMessage = `Atributos no permitidos en el elemento "${svgElement.tagName}": ${invalidAttributes.join(", ")}`;
                this.showErrorMessage(errorMessage);
                this.trustedSvg = '';
                return { invalidSVG: true };
            }

        }

        // Si el SVG pasa todas las validaciones, lo almacena en la variable "trustedSvg".
        this.trustedSvg = this.sanitizeSvg(svgCode);
        return null;

    }

    // private validateDiscountRange(control: FormControl): { [key: string]: any } | null {

    //     const descuentoControl: number = +control.value;
    //     if (descuentoControl === 0) {
    //         // if (descuentoControl) {
    //         // if (descuentoControl !== undefined && descuentoControl !== null) {
    //         console.log(descuentoControl);
    //         this.showErrorMessage('El descuento de la oferta de la categoria no puede ser cero');
    //         return { 'invalidDiscount': true };
    //         //     }
    //         // }

    //     }

    //     return null;
    // }

    private validateOfertDate(control: FormControl): { [key: string]: any } | null {
        const inputDateStr: string = control.value;
        const currentDate = new Date();

        // Check if the inputDateStr is a valid date string
        if (!/^\d{4}-\d{2}-\d{2}$/.test(inputDateStr)) {
            return { 'invalidDate': true };
        }

        const finOfertaDateControl: Date = new Date(inputDateStr);

        // Check if the parsed date is not a valid Date object
        if (isNaN(finOfertaDateControl.getTime())) {
            this.showErrorMessage('La fecha introducida no es Valida.');
            return { 'invalidDate': true };
        }

        if (finOfertaDateControl <= currentDate) {
            this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
            return { 'invalidDate': true };
        }

        return null;
    }


    validateFileUpdate(control: FormControl): { [key: string]: any } | null {

        const file: File = control.value;

        if (file instanceof File) {
            console.log('File name:', file.name);
            console.log('File type:', file.type);
            console.log('File size (in bytes):', file.size);

            // Rest of your validation logic

            const allowedTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];

            if (allowedTypes.indexOf(file.type) === -1) {
                console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
                this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
                return { invalidFileType: true }; // Invalid file type
            }

            if (file.size > 4000000) {
                console.log('La imagen no puede superar los 4MB');
                this.showErrorMessage('La imagen no puede superar los 4MB');
                return { invalidFileSize: true }; // Invalid file size
            }
        }

        // File is valid
        return null;
    }



    fileChangeEvent(event: any) {

        this.file = event.target.files && event.target.files[0];
        let reader = new FileReader(); // HTML5 FileReader API
        let file = event.target.files[0];

        if (event.target.files && event.target.files[0]) {
            if (
                file.type == 'image/png' ||
                file.type == 'image/webp' ||
                file.type == 'image/jpg' ||
                file.type == 'image/gif' ||
                file.type == 'image/jpeg'
            ) {
                if (file.size <= 4000000) {
                    reader.readAsDataURL(file);

                    // When file uploads, set it to file form control
                    reader.onload = () => {
                        this.imageUrl = reader.result;
                        this.categoriaForm.patchValue({
                            file: reader.result
                        });
                        this.editFile = false;
                        this.removeUpload = true;
                    }

                    // ChangeDetectorRef since the file is loading outside the zone
                    this.cd.markForCheck();

                    // Return a value (e.g., null) to indicate success
                    return null;

                } else {
                    console.log('La imagen no puede superar los 4MB');
                    this.showErrorMessage('La imagen no puede superar los 4MB');
                    return { invalidFileSize: true }; // Invalid file size
                }
            } else {
                console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
                this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
                return { invalidFileType: true }; // Invalid file type
            }
        } else {
            console.log('No hay una imagen para enviar');
            this.showErrorMessage('Invalid file type');
            return { required: true }; // required file
        }
    }


    // Function to remove uploaded file
    removeUploadedFile() {
        if (this.fileInput) {
            const files = this.fileInput.nativeElement.files;
            if (files) {
                let newFileList = Array.from(files);
                this.imageUrl = 'assets/img/default.jpg';
                this.editFile = true;
                this.removeUpload = false;
                this.categoriaForm.patchValue({
                    file: [null]
                });
            } else {
                console.error('No files selected.');
            }
        } else {
            console.error('fileInput is undefined.');
        }
    }




    // fileChangeEvent(event: Event): void {
    //     let file = event.target.files && event.target.files[0];
    //     if (!file) {
    //         // this.showErrorTypeFile = false;
    //         // this.showErrorSizeFile = false;
    //         // this.formSubmitted = true;
    //         console.log('No hay una imagen para enviar');
    //         let labelSelectImagen = 'Seleccionar imagen';
    //         let imgSelect = 'assets/img/default.jpg';
    //         let file = undefined;
    //         return;
    //     }
    //     // if (
    //     //     file.type == 'image/png' ||
    //     //     file.type == 'image/webp' ||
    //     //     file.type == 'image/jpg' ||
    //     //     file.type == 'image/gif' ||
    //     //     file.type == 'image/jpeg'
    //     // ) {
    //     //     if (file.size <= 4000000) {
    //     //         const reader = new FileReader();
    //     //         reader.onload = e => (imgSelect = reader.result);
    //     //         reader.readAsDataURL(file);
    //     //         labelSelectImagen = file.name;
    //     //         file = file;
    //     //     } else {
    //     //         // this.showErrorSizeFile = true;
    //     //         console.log('La imagen no puede superar los 4MB');
    //     //         labelSelectImagen = 'Seleccionar imagen';
    //     //         imgSelect = 'assets/img/default.jpg';
    //     //         file = undefined;
    //     //     }
    //     // } else {
    //     //     console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
    //     //     labelSelectImagen = 'Seleccionar imagen';
    //     //     imgSelect = 'assets/img/default.jpg';
    //     //     file = undefined;
    //     // }
    // }



    public registro(): void {


        console.log(this.categoriaForm.invalid);
        if (this.categoriaForm.invalid) {

            for (const control of Object.keys(this.categoriaForm.controls)) {
                this.categoriaForm.controls[control].markAsTouched();
            }
            this.load_btn = false;
            this.showErrorMessage(
                "Hay errores en el formulario. Por favor, verifica los campos."
            );
            return;
        }

        this.categoriaForm = this.categoriaForm.value;
        console.info("Name:", this.titulo);
        console.info("icon:", this.icono);

        this.load_btn = true;
        this.showSuccessMessage("Registro de categoría exitoso.");
    }

    resetForm(): void {
        this.categoriaForm.reset();
        Object.keys(this.categoriaForm.controls).forEach((controlName) => {
            this.categoriaForm.get(controlName)!.setErrors(null);
        });

        this.trustedSvg = null;
    }
}
