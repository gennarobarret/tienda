import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var iziToast: any;

@Component({
  selector: 'app-create-categoria',
  templateUrl: './create-categoria.component.html',
  styleUrls: ['./create-categoria.component.css']
})

constructor(
  private _productoService: ProductoService,
  private _proveedorService: ProveedorService,
  private _adminService: AdminService,
  private _router: Router
)
export class CreateCategoriaComponent {
  registro(registroForm: any) {


  }

}
