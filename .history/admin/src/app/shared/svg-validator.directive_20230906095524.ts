// import { Directive } from '@angular/core';

// @Directive({
//   selector: '[appSvgValidator]'
// })
// export class SvgValidatorDirective {

//   constructor() { }

// }


import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

export function svgValidator(): ValidatorFn {



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
  selector: '[appSvgValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: SvgValidatorDirective,
    multi: true,
  }],
})
export class SvgValidatorDirective implements Validator {

  constructor() {
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    return svgValidator()(control);
  }

}
