import { Directive } from '@angular/core';

@Directive({
  selector: '[appSvgValidationDirective]'
})
export class SvgValidationDirectiveDirective {

  constructor() { }

}

// import { Directive, Input, ElementRef, HostListener } from '@angular/core';
// import { FormControl, NG_VALIDATORS, ValidatorFn, AbstractControl } from '@angular/forms';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// @Directive({
//   selector: '[appSvgValidationDirective]',
//   providers: [
//     {
//       provide: NG_VALIDATORS,
//       useExisting: SvgValidationDirective,
//       multi: true,
//     },
//   ],
// })
// export class SvgValidationDirective {
//   @Input() appSvgValidationDirective: FormControl;

//   private allowedTags: string[] = ["svg", "circle", "polygon", "path", "text"];
//   // Define los atributos cada etiqueta permitida
//   private allowedAttributes: { [key: string]: string[] } = {
//     svg: ["xmlns", "viewBox", "height", "width", "fill", "class"],
//     circle: ["cx", "cy", "r"],
//     polygon: ["points"],
//     path: ["d", "fill-rule", "id", "class", "clip-path", "mask", "filter", "vector-effect", "pathLength"],
//     text: ["x", "y", "text-anchor", "font-family", "font-size", "text-align"]
//   };
//   // Define los patrones regex para cada atributo
//   private validAttributes: { [key: string]: RegExp } = {
//     xmlns: /^(https?:\/\/[^\s]+)|\s*$/,  // Acepta una URL o una cadena vacía.
//     viewBox: /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/,  // Acepta coordenadas de vista.
//     height: /^[\d.]+(px|%|em|rem|vh|vw)?$/,  // Acepta altura con unidades opcionales.
//     width: /^[\d.]+(px|%|em|rem|vh|vw)?$/,  // Acepta ancho con unidades opcionales.
//     fill: /^([a-zA-Z]+|#\w{3,6}|(rgb|hsl)a?\([\d\s%,.]+\))$/,  // Acepta color o gradiente.
//     class: /^[a-zA-Z_][a-zA-Z0-9_ -]*$/,  // Acepta nombres de clase con letras, números, guiones bajos, guiones y espacios.
//     cx: /^-?\d+(\.\d+)?$/,  // Acepta coordenada x opcional.
//     cy: /^-?\d+(\.\d+)?$/,  // Acepta coordenada y opcional.
//     r: /^\d+(\.\d+)?$/,  // Acepta radio del círculo.
//     points: /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?(?:\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?)*$/,  // Acepta coordenadas de puntos.
//     d: /^[MmLlHhVvCcSsQqTtAaZz0-9\s,]+$/,  // Acepta comandos del trazado SVG.
//     'fill-rule': /^(evenodd|nonzero)$/,  // Acepta una regla de llenado.
//     id: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta identificadores con letras, números y guiones bajos.
//     clipPath: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de clipPath con letras, números y guiones bajos.
//     mask: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de máscara con letras, números y guiones bajos.
//     filter: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de filtro con letras, números y guiones bajos.
//     'vector-effect': /^(none|non-scaling-stroke)$/,  // Acepta un efecto de vector.
//     pathLength: /^\d+(\.\d+)?$/,  // Acepta longitud del trazado.
//     x: /^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)?$/,  // Acepta coordenada x con unidades opcionales.
//     y: /^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)?$/,  // Acepta coordenada y con unidades opcionales.
//     'text-anchor': /^(start|middle|end)$/,  // Acepta un anclaje de texto.
//     'font-family': /^[a-zA-Z\s,"']+$/,  // Acepta una familia de fuente.
//     'font-size': /^[\d.]+(px|%|em|rem)$/,  // Acepta un tamaño de fuente con unidades opcionales.
//     'text-align': /^(left|center|right|justify)$/,  // Acepta una alineación de texto.
//   };

//   constructor(private el: ElementRef, private sanitizer: DomSanitizer) { }

//   @HostListener('input', ['$event.target.value'])
//   onInput(svgCode: string) {
//     this.validateSvgIcon(svgCode);
//   }

//   validate(control: AbstractControl): { [key: string]: any } | null {
//     if (control && control.value) {
//       const svgCode: string = control.value;
//       // Llama a la función para validar SVG.
//       return this.validateSvgIcon(svgCode);
//     }
//     return null;
//   }

//   private validateSvgIcon(svgCode: string): { [key: string]: any } | null {

//     // Coloca aquí el código de validación que has proporcionado en tu pregunta.
//     // Puedes reutilizar la lógica del método `validateSVGIcon`.

//     // Si todo está correcto, devuelve null.
//     // Si hay un error, devuelve el objeto de error correspondiente.
//     // También puedes realizar acciones específicas en caso de error, como mostrar un mensaje de error en el formulario.

//     return null; // O el objeto de error correspondiente si se encuentra un problema.
//   }

//   private sanitizeSvg(svgCode: string): SafeHtml | null {
//     // Coloca aquí la lógica de sanitización que has proporcionado en tu código original.
//     // Puedes reutilizar la función `sanitizeSvg`.

//     return null; // O el SVG sanitizado como SafeHtml.
//   }
// }
