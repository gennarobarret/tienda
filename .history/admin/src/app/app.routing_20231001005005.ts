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
//SUBCATEGORIAS
import { IndexSubcategoriaComponent } from './components/subcategorias/index-subcategoria/index-subcategoria.component';
import { CreateSubcategoriaComponent } from './components/subcategorias/create-subcategoria/create-subcategoria.component';
import { EditSubcategoriaComponent } from './components/subcategorias/edit-subcategoria/edit-subcategoria.component';
//OFERTAS
import { IndexOfertaComponent } from './components/ofertas/index-oferta/index-oferta.component';
import { CreateOfertaComponent } from './components/ofertas/create-oferta/create-oferta.component';
import { EditOfertaComponent } from './components/ofertas/edit-oferta/edit-oferta.component';
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
                path: 'categorias',
                component: IndexCategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'categorias/registro',
                component: CreateCategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'categorias/:id',
                component: EditCategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'subcategorias',
                component: IndexSubcategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'subcategorias/registro',
                component: CreateSubcategoriaComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'subcategorias/:id',
                component: EditSubcategoriaComponent,
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