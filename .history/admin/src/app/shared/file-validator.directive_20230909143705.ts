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

    if (file instanceof File) {
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size (in bytes):', file.size);

      const allowedTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];

      if (allowedTypes.indexOf(file.type) === -1) {
        const errorMessage = 'El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.';
        showErrorMessage(errorMessage);
        return { invalidFileType: true }; // Invalid file type
      }

      if (file.size > 4000000) {
        const errorMessage = 'La imagen no puede superar los 4MB.';
        showErrorMessage(errorMessage);
        return { invalidFileSize: true }; // Invalid file size
      }
    } else {
      showErrorMessage('No se ha seleccionado ningún archivo.');
      return { noFileSelected: true }; // No file selected
    }

    return null; // Validation successful
  };
}

function validateFile(
  fileContent: string,

): boolean {




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
