import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import DOMPurify from 'dompurify';

declare let iziToast: any;
declare let jQuery: any;
declare let $: any;

@Component({
    selector: 'app-create-categoria',
    templateUrl: './create-categoria.component.html',
    styleUrls: ['./create-categoria.component.css']
})
export class CreateCategoriaComponent implements OnInit {
    categoriaForm: FormGroup;
    // ... other properties

    constructor(
        private _adminService: AdminService,
        private _categoriaService: CategoriaService,
        private _router: Router,
        private sanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
    ) {
        // ... initialize properties
    }

    ngOnInit() {
        this.initForm();
        this.ofertaInactive();
    }

    initForm(): void {
        this.categoriaForm = this.formBuilder.group({
            titulo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\sñÑ]+$/)]],
            // ... other form controls
        });
    }

    // ... other methods
}
