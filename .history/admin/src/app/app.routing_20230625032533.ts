import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AdminGuard } from './guards/admin.guard';

//INICIO
import { InicioComponent } from './components/inicio/inicio.component';
//LOGIN
import { LoginComponent } from './components/login/login.component';
//CATEGORIAS
import { IndexCategoriaComponent } from './components/categorias/index-categoria/index-categoria.component';
import { CreateCategoriaComponent } from './components/categorias/create-categoria/create-categoria.component';
import { EditCategoriaComponent } from './components/categorias/edit-categoria/edit-categoria.component';
//CLIENTE
import { IndexClienteComponent } from './components/clientes/index-cliente/index-cliente.component';
import { CreateClienteComponent } from './components/clientes/create-cliente/create-cliente.component';
import { EditClienteComponent } from './components/clientes/edit-cliente/edit-cliente.component';
//PROVEEDOR
import { IndexProveedorComponent } from './components/proveedores/index-proveedor/index-proveedor.component';
import { CreateProveedorComponent } from './components/proveedores/create-proveedor/create-proveedor.component';
import { EditProveedorComponent } from './components/proveedores/edit-proveedor/edit-proveedor.component';
//PRODUCTOS
import { CreateProductoComponent } from "./components/productos/create-producto/create-producto.component";



const appRoute: Routes = [
    { path: '', component: InicioComponent, canActivate: [AdminGuard] },


    {
        path: 'panel',
        children: [
            {
                path: 'categoria',
                component: IndexCategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'categoria/registro',
                component: CreateCategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'categoria/:id',
                component: EditCategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'clientes',
                component: IndexClienteComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'clientes/registro',
                component: CreateClienteComponent,
                canActivate: [AdminGuard],
            },
            {
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
            },
            {
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