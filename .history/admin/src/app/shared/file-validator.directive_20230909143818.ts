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
