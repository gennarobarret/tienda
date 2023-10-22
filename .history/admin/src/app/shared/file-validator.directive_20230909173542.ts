import { Directive, HostListener, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {

  const EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = EMAIL_REGEXP.test(control.value);

    if (isValid) {
      return null;
    } else {
      return {
        emailValidator: {
          valid: false,
        },
      };
    }
  };

}

@Directive({
  selector: '[appEmailValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: EmailValidatorDirective,
    multi: true,
  }],
})

export class EmailValidatorDirective implements Validator {

  constructor() {
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    return emailValidator()(control);
  }

}










declare let iziToast: any;

@Directive({
  selector: '[appFileValidator]'
})




export class FileValidatorDirective {
  @Input() maxSize: number = 4000000; // Tamaño máximo en bytes (4MB)
  @Input() allowedTypes: string[] = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];

  constructor() { }

  @HostListener('change', ['$event'])
  onChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      // No se seleccionó ningún archivo
      return;
    }

    if (!this.allowedTypes.includes(file.type)) {
      // Tipo de archivo no permitido
      this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, o JPEG.');
      return;
    }

    if (file.size > this.maxSize) {
      // Tamaño de archivo excede el límite
      this.showErrorMessage('La imagen no puede superar los 4MB');
      return;
    }

    // Todas las validaciones pasaron, puedes procesar el archivo aquí si es necesario
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const imageUrl = reader.result as string;
      // Haz lo que necesites con la imagen (por ejemplo, mostrarla en la vista)
    };
  }

  showErrorMessage(message: string) {
    iziToast.show({
      title: "ERROR",
      titleColor: "#FF0000",
      color: "#FFF",
      class: "text-danger",
      position: "topRight",
      message: message,
    });
  }
}
