import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { NgForm } from '@angular/forms';

declare var iziToast: any;

@Component({
  selector: 'app-edit-proveedor',
  templateUrl: './edit-proveedor.component.html',
  styleUrls: ['./edit-proveedor.component.css']
})
export class EditProveedorComponent implements OnInit {

  @ViewChild('updateForm', { static: false }) updateForm!: NgForm;

  public formSubmitted = false;
  public proveedor: any = { country: '', state: '' };
  public id: any;
  public token;

  country: any[] = [];
  countries: any[] = [];
  countries_arr: any[] = [];
  states: any[] = [];
  country_divGeo: string = '';
  country_phone_code: string = '';

  constructor(
    private _route: ActivatedRoute,
    private _proveedorService: ProveedorService,
    private _adminService: AdminService,
    private _router: Router,
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this._proveedorService.obtener_proveedor_admin(this.id, this.token).subscribe(
        response => {
          if (response.data == undefined) {
            this.proveedor = undefined;
          } else {
            this.proveedor = response.data;
            this._proveedorService.get_Countries().subscribe(
              (response) => {
                response.forEach((element: any) => {
                  this.countries.push({
                    country_id: element.id,
                    country_name: element.name,
                    country_abbrev: element.iso2,
                    country_phone_code: element.prefix,
                    country_divGeo: element.divGeo,
                  });
                });
                // Sort the countries array by country_name property
                this.sortByProperty(this.countries, 'country_name');
              }
            );

            this._proveedorService.get_States().subscribe(
              (response) => {
                response.forEach((element: any) => {
                  var country_id = element.country_id;
                  var province_abbrev = element.province_abbrev;
                  var province_name = element.province_name;
                  if (element.country_id == this.proveedor.country) {
                    this.states.push({
                      country_id: country_id,
                      province_abbrev: province_abbrev,
                      province_name: province_name
                    });
                  }
                });

                this.states.sort((a, b) => a.province_name.localeCompare(b.province_name));

              }
            );
          }
        },
        error => {
          // Handle error
        }
      );
    });
  }


  sortByProperty(arr: any[], property: string) {
    return arr.sort((a, b) => a[property].localeCompare(b[property]));
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

          if (selectedCountryId == element.id) {
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


  actualizar(updateForm: any) {
    this.formSubmitted = true;
    if (updateForm.valid) {
      this._proveedorService.actualizar_proveedor_admin(this.id, this.proveedor, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se actualizó correctamente el nuevo proveedor',
          });
          this._router.navigate(['/panel/proveedores']);
        },
        error => {
          if (error.status === 400 && error.error.message === 'El email ya esta registrado.') {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'El email ya existe en la base de datos',
            });
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'Ocurrió un error en el registro',
            });
          }
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos',
      });
    }
  }


}
