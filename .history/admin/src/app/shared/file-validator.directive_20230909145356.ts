import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

declare let iziToast: any;

function showErrorMessage(message: string) {
  iziToast.show({
    title: "ERROR",
    titleColor: "#FF0000",
    color: "#FFF",
    class: "text-danger",
    position: "topRight",
    message: message,
  });
}


function fileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file: File | null = control.value;

    if (!file) {
      return null; // El control es válido si no hay archivo seleccionado
    }

    if (!(file instanceof File)) {
      return { fileValidator: { invalidFileType: true } };
    }

    const allowedTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];

    if (allowedTypes.indexOf(file.type) === -1) {
      showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.');
      return { fileValidator: { invalidFileType: true } };
    }

    if (file.size > 4000000) {
      showErrorMessage('La imagen no puede superar los 4MB.');
      return { fileValidator: { invalidFileSize: true } };
    }

    return null; // El archivo es válido
  };
}

@Directive({
  selector: '[appFileValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: FileValidatorDirective,
    multi: true,
  }],
})
export class FileValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return fileValidator()(control);
  }
}
