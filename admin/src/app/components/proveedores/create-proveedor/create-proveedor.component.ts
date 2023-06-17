import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { NgForm } from '@angular/forms';

declare var iziToast: any;

@Component({
    selector: 'app-create-proveedor',
    templateUrl: './create-proveedor.component.html',
    styleUrls: ['./create-proveedor.component.css'],
})
export class CreateProveedorComponent implements OnInit {

    @ViewChild('proveedorForm', { static: false }) proveedorForm!: NgForm;

    public formSubmitted = false;
    public proveedor: any = { country: '', state: '', prefix: '' };
    public token: any;

    countries: any[] = [];
    countries_arr: any[] = [];
    states: any[] = [];
    country_divGeo: string = '';
    country_phone_code: string = '';

    constructor(
        private _proveedorService: ProveedorService,
        private _adminService: AdminService,
        private _router: Router
    ) {
        this.token = this._adminService.getToken();
    }

    ngOnInit(): void {
        this.loadCountries();
    }

    sortByProperty(arr: any[], property: string) {
        return arr.sort((a, b) => a[property].localeCompare(b[property]));
    }

    loadCountries() {
        this._proveedorService.get_Countries().subscribe(
            (response) => {
                this.countries = this.sortByProperty(response, 'name');
            },
            (error) => {
                console.log(error);
            }
        );
    }


    onCountryChange() {

        this.states = [];
        this.countries_arr = [];
        this.proveedor.state = '';
        this.proveedor.phone = '';

        const { country } = this.proveedor;
        const selectedCountryId = country;

        this._proveedorService.get_States().subscribe(
            (response) => {
                response.forEach((element: any) => {
                    if (element.country_id == selectedCountryId) {
                        this.states.push({
                            country_id: element.country_id,
                            province_abbrev: element.province_abbrev,
                            province_name: element.province_name
                        });
                    }
                });

                this.states.sort((a, b) => a.province_name.localeCompare(b.province_name));
            }
        );


        this._proveedorService.get_Countries().subscribe(
            (response) => {
                response.forEach((element: any) => {
                    if (element.id == selectedCountryId) {
                        this.countries_arr.push({
                            country_id: element.id,
                            country_abbrev: element.iso2,
                            country_phone_code: element.prefix,
                            country_divGeo: element.divGeo,
                        });
                    }
                });
                const firstElement = this.countries_arr[0];
                this.country_divGeo = firstElement ? firstElement.country_divGeo : '';
                this.country_phone_code = firstElement ? firstElement.country_phone_code : '';
                this.proveedor.phone = this.country_phone_code + (this.proveedor.phone || '').replace(this.country_phone_code, '');
            }
        );

    }

    registro() {
        this.formSubmitted = true;
        if (this.proveedorForm.valid) {
            this._proveedorService
                .registro_proveedor_admin(this.proveedor, this.token)
                .subscribe(
                    (response) => {
                        iziToast.show({
                            title: 'SUCCESS',
                            titleColor: '#1DC74C',
                            color: '#FFF',
                            class: 'text-success',
                            position: 'topRight',
                            message: 'Se registró correctamente el nuevo proveedor',
                        });

                        this.proveedor = {
                            name: '',
                            company: '',
                            street1: '',
                            street2: '',
                            city: '',
                            state: '',
                            zip: '',
                            country: '',
                            phone: '',
                            email: ''
                        };
                        this._router.navigate(['/panel/proveedores']);
                    },
                    (error) => {
                        if (
                            error.status === 404 &&
                            error.error.message === 'El email ya esta registrado.'
                        ) {
                            iziToast.show({
                                title: 'ERROR',
                                titleColor: '#FF0000',
                                color: '#FFF',
                                class: 'text-Danger',
                                position: 'topRight',
                                message: 'El email ya existe en la base de datos',
                            });
                        } else {
                            iziToast.show({
                                title: 'ERROR',
                                titleColor: '#FF0000',
                                color: '#FFF',
                                class: 'text-Danger',
                                position: 'topRight',
                                message: 'Ocurrió un error en el registro',
                            });
                        }
                    }
                );

        } else {
            iziToast.error({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-Danger',
                position: 'topRight',
                message: 'Los datos del formulario no son válidos',
            });
            return;
        }
    }
}







