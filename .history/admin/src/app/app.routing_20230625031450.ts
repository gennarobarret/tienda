import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';

import { AdminGuard } from './guards/admin.guard';

import { IndexClienteComponent } from './components/clientes/index-cliente/index-cliente.component';
import { CreateClienteComponent } from './components/clientes/create-cliente/create-cliente.component';
import { EditClienteComponent } from './components/clientes/edit-cliente/edit-cliente.component';

import { IndexProveedorComponent } from './components/proveedores/index-proveedor/index-proveedor.component';
import { CreateProveedorComponent } from './components/proveedores/create-proveedor/create-proveedor.component';
import { EditProveedorComponent } from './components/proveedores/edit-proveedor/edit-proveedor.component';

import { CreateProductoComponent } from "./components/productos/create-producto/create-producto.component";


const appRoute: Routes = [
    { path: '', component: InicioComponent, canActivate: [AdminGuard] },


    {
        path: 'panel',
        children: [
            {
                path: 'clientes',
                component: IndexClienteComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'clientes/registro',
                component: CreateClienteComponent,
                canActivate: [AdminGuard],
            }, {
                path: 'clientes/:id',
                component: EditClienteComponent,
                canActivate: [AdminGuard],
            }, {
                path: 'clientes',
                component: IndexClienteComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'clientes/registro',
                component: CreateClienteComponent,
                canActivate: [AdminGuard],
            }, {
                path: 'clientes/:id',
                component: EditClienteComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'proveedores',
                component: IndexProveedorComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'proveedores/registro',
                component: CreateProveedorComponent,
                canActivate: [AdminGuard],
            }, {
                path: 'proveedores/:id',
                component: EditProveedorComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'productos/registro',
                component: CreateProductoComponent,
                canActivate: [AdminGuard],
            },
        ],
    },
    { path: 'login', component: LoginComponent },

]

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoute);