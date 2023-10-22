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
