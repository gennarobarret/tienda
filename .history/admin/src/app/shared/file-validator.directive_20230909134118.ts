import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

declare let iziToast: any;

export function fileValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    const file: string = control.value;
    const isValid = validateFILE(file);

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

function validateFILE(
  file: string,
): boolean {

  if (file) {
    return true; // Return true for now, update with your actual validation logic.
  }

  showErrorMessage('there is no file content to validate');
  return false;
};


@Directive({
  selector: '[appFileValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: FileValidatorDirective,
    multi: true,
  }],
})
export class FileValidatorDirective {

  constructor() { }

  public validate(control: AbstractControl): ValidationErrors | null {
    return fileValidator()(control);
  }
}
