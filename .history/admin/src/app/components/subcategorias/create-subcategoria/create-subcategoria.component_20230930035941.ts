import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { AdminService } from "src/app/services/admin.service";
import { CategoriaService } from "src/app/services/categoria.service";

@Component({
  selector: 'app-create-subcategoria',
  templateUrl: './create-subcategoria.component.html',
  styleUrls: ['./create-subcategoria.component.css']
})
export class CreateSubcategoriaComponent {


  load_data = true;
  filtro = '';
  token;
  categorias: any[] = [];
  url;
  page = 1;
  pageSize = 20;
  load_btn = false;
  sanitizedSvgContent: any;
  selectedImage: string | undefined;
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private _categoriaService: CategoriaService,
    private sanitizer: DomSanitizer,
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this._categoriaService.listar_categorias_admin(this.filtro, this.token).subscribe(
      response => {
        this.categorias = response.data;
        this.categorias.forEach(element => {
          element.icono = this.sanitizedSvgContent = this.sanitizer.bypassSecurityTrustHtml(element.icono);
          element.estado = (element.estado) ? "activo" : "inactivo";
          element.oferta = (element.oferta) ? "activo" : "inactivo";
        });
        this.load_data = false;
      },

      error => {
        console.log(error);
      }
    )
  }

}
