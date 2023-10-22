import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

declare let iziToast: any;

export function fileValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    const file: string = control.value;
    // Parse the SVG content and validate its elements and attributes here
    const isValid = validateSVG(file);


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

function validateSVG(
  svgContent: string,
): boolean {

  // Continue with the rest of your SVG validation logic here...
  return true; // Return true for now, update with your actual validation logic.


  // Handle cases where there is no SVG content to validate.
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
