import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ProveedorService } from 'src/app/services/proveedor.service';

declare var iziToast: any;
declare var jQuery: any;
declare var $: any;


@Component({
    selector: 'app-index-proveedor',
    templateUrl: './index-proveedor.component.html',
    styleUrls: ['./index-proveedor.component.css'],
})

export class IndexProveedorComponent implements OnInit {
    public proveedores: Array<any> = [];
    public filtro_company = '';
    public filtro_correo = '';

    public page = 1;
    public pageSize = 20;
    public token;
    public load_data = true;
    public load_btn = false;

    constructor(
        private _proveedorService: ProveedorService,
        private _adminService: AdminService
    ) {
        this.token = this._adminService.getToken();
    }

    ngOnInit(): void {
        this.init_Data();
    }

    init_Data() {
        this._proveedorService
            .listar_proveedores_filtro_admin(null, null, this.token)
            .subscribe(
                (response) => {
                    this.proveedores = response.data;
                    this.load_data = false;
                },
                (error) => {
                    console.error(error);
                }
            );
    }

    filtro(tipo: any) {
        var filtro;
        if (tipo == 'company') {
            if (this.filtro_company) {
                this._proveedorService
                    .listar_proveedores_filtro_admin(tipo, this.filtro_company, this.token)
                    .subscribe(
                        (response) => {
                            this.proveedores = response.data;
                            this.load_data = false;
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
            } else {
                this.init_Data();
            }
        } else if (tipo == 'correo') {
            if (this.filtro_correo) {
                this._proveedorService
                    .listar_proveedores_filtro_admin(tipo, this.filtro_correo, this.token)
                    .subscribe(
                        (response) => {
                            this.proveedores = response.data;
                            this.load_data = false;
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
            } else {
                this.init_Data();
            }
        }
    }

    eliminar(id: any) {
        load_btn
        this._proveedorService.eliminar_proveedor_admin(id, this.token).subscribe(
            respose => {
                iziToast.show({
                    title: 'SUCCESS',
                    titleColor: '#1DC74C',
                    color: '#FFF',
                    class: 'text-success',
                    position: 'topRight',
                    message: 'Se elimino correctamente el proveedor',
                });

                $('#delete-' + id).modal('hide');
                $('.modal-backdrop').removeClass('show');
                this.init_Data();

            }, error => {
                console.log(error);
            }
        )
    }
}