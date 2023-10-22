import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { svgValidator } from "src/app/shared/svg-validator.directive";
import { AdminService } from "src/app/services/admin.service";
import { CategoriaService } from "src/app/services/categoria.service";
import { GLOBAL } from 'src/app/services/GLOBAL';

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
        console.log(this.categorias);
        this.categorias.forEach(element => {
          element.id = element._id;
          element.titulo = element.titulo;
          console.log(element.titulo);
          console.log(element.id);
        });

        this.load_data = false;
      },
      error => {
        console.log(error);
      }
    );
  }


}
