import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxTinymceModule } from 'ngx-tinymce';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { InicioComponent } from './components/inicio/inicio.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
// CLIENTE
import { IndexClienteComponent } from './components/clientes/index-cliente/index-cliente.component';
import { CreateClienteComponent } from './components/clientes/create-cliente/create-cliente.component';
import { EditClienteComponent } from './components/clientes/edit-cliente/edit-cliente.component';

import { IndexProveedorComponent } from './components/proveedores/index-proveedor/index-proveedor.component';
import { EditProveedorComponent } from './components/proveedores/edit-proveedor/edit-proveedor.component';
import { CreateProveedorComponent } from './components/proveedores/create-proveedor/create-proveedor.component';
import { CreateProductoComponent } from './components/productos/create-producto/create-producto.component';
import { IndexCategoriaComponent } from './components/categorias/index-categoria/index-categoria.component';
import { CreateCategoriaComponent } from './components/categorias/create-categoria/create-categoria.component';
import { EditCategoriaComponent } from './components/categorias/edit-categoria/edit-categoria.component';
import { SvgValidatorDirective } from './shared/svg-validator.directive';
import { EditSubcategoriaComponent } from './components/subcategorias/edit-subcategoria/edit-subcategoria.component';
import { CreateSubcategoriaComponent } from './components/subcategorias/create-subcategoria/create-subcategoria.component';
import { IndexSubcategoriaComponent } from './components/subcategorias/index-subcategoria/index-subcategoria.component';
import { CreateOfertaComponent } from './components/ofertas/create-oferta/create-oferta.component';
import { EditOfertaComponent } from './components/ofertas/edit-oferta/edit-oferta.component';
import { IndexOfertaComponent } from './components/ofertas/index-oferta/index-oferta.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    SidebarComponent,
    LoginComponent,
    IndexClienteComponent,
    CreateClienteComponent,
    EditClienteComponent,
    IndexProveedorComponent,
    EditProveedorComponent,
    CreateProveedorComponent,
    CreateProductoComponent,
    IndexCategoriaComponent,
    CreateCategoriaComponent,
    EditCategoriaComponent,
    SvgValidatorDirective,
    EditSubcategoriaComponent,
    CreateSubcategoriaComponent,
    IndexSubcategoriaComponent,
    CreateOfertaComponent,
    EditOfertaComponent,
    IndexOfertaComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    routing,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgxTinymceModule.forRoot({ baseURL: '../../../assets/tinymce/' }),

  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
