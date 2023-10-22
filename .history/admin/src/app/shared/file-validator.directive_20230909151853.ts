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
    const file: File = control.value as File;

    const isValid = validateFile(file);

    if (isValid) {
      return null;
    } else {
      return {
        fileValidator: {
          valid: false,
        },
      };
    }
  };
}

function validateFile(
  file: File,
): boolean {

  if (file instanceof File) {
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size (in bytes):', file.size);

    // Rest of your validation logic

    const allowedTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];

    if (allowedTypes.indexOf(file.type) === -1) {
      console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
      showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
      return false; // Invalid file size
    }

    if (file.size > 4000000) {
      console.log('La imagen no puede superar los 4MB');
      showErrorMessage('La imagen no puede superar los 4MB');
      return false; // Invalid file size
    }
  }
  return true
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
