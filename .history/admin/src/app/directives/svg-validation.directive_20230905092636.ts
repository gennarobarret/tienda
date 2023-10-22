// import { Directive } from '@angular/core';

// @Directive({
//   selector: '[appSvgValidationDirective]'
// })
// export class SvgValidationDirectiveDirective {

//   constructor() { }

// }

import { Directive, Input, ElementRef, HostListener } from '@angular/core';
import { FormControl, NG_VALIDATORS, ValidatorFn, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Directive({
  selector: '[appSvgValidationDirective]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: SvgValidationDirective,
      multi: true,
    },
  ],
})
export class SvgValidationDirective {
  // @Input() appSvgValidationDirective: FormControl;
  private allowedTags: string[] = ['svg', 'circle', 'polygon', 'path', 'text'];
  // Define los atributos y patrones regex aquí (como se muestra en tu código).

  constructor(private el: ElementRef, private sanitizer: DomSanitizer) { }

  @HostListener('input', ['$event.target.value'])
  onInput(svgCode: string) {
    this.validateSvgIcon(svgCode);
  }

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control && control.value) {
      const svgCode: string = control.value;
      // Llama a la función para validar SVG.
      return this.validateSvgIcon(svgCode);
    }
    return null;
  }

  private validateSvgIcon(svgCode: string): { [key: string]: any } | null {
    // Coloca aquí el código de validación que has proporcionado en tu pregunta.
    // Puedes reutilizar la lógica del método `validateSVGIcon`.

    // Si todo está correcto, devuelve null.
    // Si hay un error, devuelve el objeto de error correspondiente.
    // También puedes realizar acciones específicas en caso de error, como mostrar un mensaje de error en el formulario.

    return null; // O el objeto de error correspondiente si se encuentra un problema.
  }

  private sanitizeSvg(svgCode: string): SafeHtml | null {
    // Coloca aquí la lógica de sanitización que has proporcionado en tu código original.
    // Puedes reutilizar la función `sanitizeSvg`.

    return null; // O el SVG sanitizado como SafeHtml.
  }
}
