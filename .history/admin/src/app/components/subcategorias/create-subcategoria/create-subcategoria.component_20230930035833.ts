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
    private _adminService: AdminService,
    private _categoriaService: CategoriaService,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.config = {
      height: 500,
    };
    this.token = this._adminService.getToken();
    this.updateForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), Validators.pattern("^[a-zA-Z0-9\\sñÑ]+$")]],
      icono: ['', [Validators.required, svgValidator()]],
      estado: ['', [Validators.required]],
      oferta: ['', [Validators.required]],
      descuento_oferta: ['', [Validators.required, this.validateDiscountRange.bind(this)]],
      fin_oferta: ['', [Validators.required, this.validateOfertDate.bind(this)]],
      portada: ['', [Validators.required]],
      createdAt: [''],
      updatedAt: [''],
    });

  }

}
