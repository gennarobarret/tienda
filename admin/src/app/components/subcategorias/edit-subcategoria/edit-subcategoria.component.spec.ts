import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubcategoriaComponent } from './edit-subcategoria.component';

describe('EditSubcategoriaComponent', () => {
  let component: EditSubcategoriaComponent;
  let fixture: ComponentFixture<EditSubcategoriaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSubcategoriaComponent]
    });
    fixture = TestBed.createComponent(EditSubcategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
