import { Component, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import DOMPurify from 'dompurify';

declare let iziToast: any;
declare let jQuery: any;
declare let $: any;

@Component({
    selector: 'app-create-categoria',
    templateUrl: './create-categoria.component.html',
    styleUrls: ['./create-categoria.component.css']
})
export class CreateCategoriaComponent {
    @ViewChild('categoriaForm', { static: false }) categoriaForm!: NgForm;
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

    public file: any = undefined;
    public imgSelect: any | ArrayBuffer = 'assets/img/default.jpg';
    public labelSelectImagen: string = 'Seleccionar imagen';
    public config: any = {};
    public token;
    public load_btn = false;
    public config_global: any = {};
    public formSubmitted = false;
    public categoria: any = {
        estado: '',
        oferta: ''
    };
    public showViewer: boolean = false;
    public sanitizedSvgCode: SafeHtml = '';
    public filtro = '';
    public showRepeatedTitleError: boolean = false;
    public showErrorInvalidSvg: boolean = false;
    public showErrorZero: boolean = false;
    public showErrorInvalidDate: boolean = false;
    public showErrorTypeFile: boolean = false;
    public showErrorSizeFile: boolean = false;
    public defaultDate = '2000-01-01';
    public currentDate = new Date();
    public finOfertaDate: any = '';
    public isOfertaInactive: boolean = false;
    public trustedSvg: SafeHtml | undefined;

    constructor(
        private _adminService: AdminService,
        private _categoriaService: CategoriaService,
        private _router: Router,
        private sanitizer: DomSanitizer,
    ) {
        this.config = {
            height: 500
        };
        this.token = this._adminService.getToken();
    }

    ngOnInit() {
        this.ofertaInactive();
    }

    validateTitle() {
        this.showRepeatedTitleError = false;
    }


    validateSvgCode() {
        const svgCode = this.categoria.icono;

        if (!svgCode || typeof svgCode !== 'string' || svgCode.trim() === '') {

            this.resetSvgValidationState();
            this.categoriaForm.controls['icono'].markAsTouched();
            return;
        }

        const svgRegex = /^<svg[\s\S]*<\/svg>$/i;
        const isValidSvg = svgRegex.test(svgCode);
        const hasXmlnsAttribute = svgCode.includes('xmlns="http://www.w3.org/2000/svg"');

        if (!isValidSvg || !hasXmlnsAttribute) {

            this.setInvalidSvgState();
        } else {

            this.setValidSvgState();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(svgCode, 'image/svg+xml');

            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {

                this.setInvalidSvgState();
            } else {
                const purifiedSvg = DOMPurify.sanitize(svgCode);
                this.sanitizedSvgCode = this.sanitizer.bypassSecurityTrustHtml(purifiedSvg);
            }
        }
    }

    resetSvgValidationState() {
        this.showViewer = false;
        this.showErrorInvalidSvg = false;
        this.sanitizedSvgCode = '';
    }

    setInvalidSvgState() {
        this.showErrorInvalidSvg = true;
        this.showViewer = false;
        this.sanitizedSvgCode = '';
    }

    setValidSvgState() {
        this.showErrorInvalidSvg = false;
        this.showViewer = true;
    }


    ofertaInactive() {
        this.isOfertaInactive = this.categoria.oferta == '0' || this.categoria.oferta == '';
        if (this.isOfertaInactive) {
            this.categoria.descuento_oferta = '0';
            this.categoria.fin_oferta = this.defaultDate;
            this.labelSelectImagen = 'Seleccionar imagen';
            this.imgSelect = 'assets/img/default.jpg';
            this.file = undefined;
            this.showErrorZero = false;
            this.showErrorInvalidDate = false;
            this.showErrorTypeFile = false;
        } else {
            this.categoria.descuento_oferta = '';
            this.categoria.fin_oferta = '';
            this.file = undefined;
        }
    }


    validateDiscountRange() {
        if (this.categoria.descuento_oferta > 100) {
            this.categoria.descuento_oferta = 100;
        } else if (this.categoria.descuento_oferta < 0) {
            this.categoria.descuento_oferta = 0;
        }
        if (this.categoria.descuento_oferta === '0') {
            this.showErrorZero = true;
        } else {
            this.showErrorZero = false;
        }
    }

    restrictInput(event: any) {
        const charCode = event.charCode;
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    }

    limitInputLength(event: any) {
        const inputValue = event.target.value;
        if (inputValue.length > 3) {
            event.target.value = inputValue.slice(0, 3);
        }
    }

    validateOfertDate() {
        this.finOfertaDate = new Date(this.categoria.fin_oferta);
        if ((new Date(this.categoria.fin_oferta)) <= this.currentDate) {
            this.showErrorInvalidDate = true;
        } else {
            this.showErrorInvalidDate = false;
        }
    }

    fileChangeEvent(event: any): void {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            this.showErrorTypeFile = false;
            this.showErrorSizeFile = false;
            // this.formSubmitted = true;
            this.showFileErrorMessage('No hay una imagen para enviar');
            this.labelSelectImagen = 'Seleccionar imagen';
            this.imgSelect = 'assets/img/default.jpg';
            this.file = undefined;
            return;
        }
        if (
            file.type == 'image/png' ||
            file.type == 'image/webp' ||
            file.type == 'image/jpg' ||
            file.type == 'image/gif' ||
            file.type == 'image/jpeg'
        ) {
            if (file.size <= 4000000) {
                const reader = new FileReader();
                reader.onload = e => (this.imgSelect = reader.result);
                reader.readAsDataURL(file);
                this.labelSelectImagen = file.name;
                this.file = file;
            } else {
                this.showErrorSizeFile = true;
                this.showFileErrorMessage('La imagen no puede superar los 4MB');
                this.labelSelectImagen = 'Seleccionar imagen';
                this.imgSelect = 'assets/img/default.jpg';
                this.file = undefined;
            }
        } else {
            this.showErrorTypeFile = true;

            this.showFileErrorMessage(
                'El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.'
            );
            this.labelSelectImagen = 'Seleccionar imagen';
            this.imgSelect = 'assets/img/default.jpg';
            this.file = undefined;
        }
    }

    registro() {
        this.formSubmitted = true;
        if (!this.categoriaForm.valid) {
            const tituloControl = this.categoriaForm.form.get('titulo');
            if (tituloControl && tituloControl.errors && tituloControl.errors['pattern']) {
                this.showErrorMessage('Solo usa letras, números y ñ o Ñ en este campo.');
            } else {
                this.showErrorMessage('Los datos del formulario no son válidos');
            }
            this.load_btn = false;
            return;
        }

        if (this.showErrorInvalidSvg) {
            this.showErrorMessage('El código SVG ingresado no es válido.');
            this.load_btn = false;
            return;
        }

        if (this.categoria.oferta === '1' && this.categoria.descuento_oferta === '0') {
            this.showErrorMessage('El % de descuento de la oferta no puede ser 0.');
            this.load_btn = false;
            return;
        }

        if (this.categoria.oferta === '1' && this.finOfertaDate < this.currentDate) {
            this.showErrorMessage('La fecha de finalización de la oferta no puede ser anterior a la fecha actual.');
            this.load_btn = false;
            return;
        }

        this.filtro = this.categoria.titulo.toLowerCase();


        this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
            (titulos) => {
                const tituloBuscado = titulos.data.map((element: any) => element.titulo);
                if (tituloBuscado.includes(this.filtro)) {
                    this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                    this.showRepeatedTitleError = true;
                } else {
                    this._categoriaService.registro_categoria_admin(this.categoria, this.file, this.token).subscribe(
                        (response) => {
                            this.showSuccessMessage('Se registró correctamente el nuevo categoría.');
                            this.load_btn = true;
                            this._router.navigate(['/panel/categorias']);
                        },
                        (error) => {
                            if (error.status === 409 && error.error.message === 'Ya existe una categoría con el mismo título.') {
                                this.showErrorMessage('Ya existe una categoría asociada a ese título en la base de datos');
                                this.showRepeatedTitleError = true;
                            } else {
                                this.showErrorMessage('Ocurrió un error en la actualización');
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


    showFileErrorMessage(message: string) {
        iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: message,
        });
        $('#input-portada').text('Seleccionar imagen');
        this.imgSelect = 'assets/img/default.jpg';
        this.file = undefined;
    }

    showErrorMessage(message: string) {
        iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: message
        });
    }

    showSuccessMessage(message: string) {
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: message
        });
    }

    resetForm() {
        this.categoriaForm.resetForm();
        this.categoria = {
            estado: '',
            oferta: '',
        };
        this.categoriaForm.form.get('estado')?.setValue('', { onlySelf: true });
        this.categoriaForm.form.get('oferta')?.setValue('', { onlySelf: true });
        this.imgSelect = 'assets/img/default.jpg';
        this.file = undefined;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
        this.labelSelectImagen = 'Seleccionar imagen';
        this.showViewer = false;
        this.showErrorInvalidDate = false;
        this.showErrorTypeFile = false;
        this.showErrorSizeFile = false;
    }

}
