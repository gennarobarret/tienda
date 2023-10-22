import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import DOMPurify from "dompurify";

declare let iziToast: any;


// Define las etiquetas permitidas
const allowedTags: string[] = ["svg", "circle", "polygon", "path", "text"];
// Define los atributos cada etiqueta permitida
const allowedAttributes: { [key: string]: string[] } = {
  svg: ["xmlns", "viewBox", "height", "width", "fill", "class"],
  circle: ["cx", "cy", "r"],
  polygon: ["points"],
  path: ["d", "fill-rule", "id", "class", "clip-path", "mask", "filter", "vector-effect", "pathLength"],
  text: ["x", "y", "text-anchor", "font-family", "font-size", "text-align"]
};
// Define los patrones regex para cada atributo
const validAttributes: { [key: string]: RegExp } = {
  xmlns: /^(https?:\/\/[^\s]+)|\s*$/,  // Acepta una URL o una cadena vacía.
  viewBox: /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/,  // Acepta coordenadas de vista.
  height: /^[\d.]+(px|%|em|rem|vh|vw)?$/,  // Acepta altura con unidades opcionales.
  width: /^[\d.]+(px|%|em|rem|vh|vw)?$/,  // Acepta ancho con unidades opcionales.
  fill: /^([a-zA-Z]+|#\w{3,6}|(rgb|hsl)a?\([\d\s%,.]+\))$/,  // Acepta color o gradiente.
  class: /^[a-zA-Z_][a-zA-Z0-9_ -]*$/,  // Acepta nombres de clase con letras, números, guiones bajos, guiones y espacios.
  cx: /^-?\d+(\.\d+)?$/,  // Acepta coordenada x opcional.
  cy: /^-?\d+(\.\d+)?$/,  // Acepta coordenada y opcional.
  r: /^\d+(\.\d+)?$/,  // Acepta radio del círculo.
  points: /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?(?:\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?)*$/,  // Acepta coordenadas de puntos.
  d: /^[MmLlHhVvCcSsQqTtAaZz0-9\s,]+$/,  // Acepta comandos del trazado SVG.
  'fill-rule': /^(evenodd|nonzero)$/,  // Acepta una regla de llenado.
  id: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta identificadores con letras, números y guiones bajos.
  clipPath: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de clipPath con letras, números y guiones bajos.
  mask: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de máscara con letras, números y guiones bajos.
  filter: /^[a-zA-Z_][a-zA-Z0-9_]*$/,  // Acepta nombres de filtro con letras, números y guiones bajos.
  'vector-effect': /^(none|non-scaling-stroke)$/,  // Acepta un efecto de vector.
  pathLength: /^\d+(\.\d+)?$/,  // Acepta longitud del trazado.
  x: /^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)?$/,  // Acepta coordenada x con unidades opcionales.
  y: /^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)?$/,  // Acepta coordenada y con unidades opcionales.
  'text-anchor': /^(start|middle|end)$/,  // Acepta un anclaje de texto.
  'font-family': /^[a-zA-Z\s,"']+$/,  // Acepta una familia de fuente.
  'font-size': /^[\d.]+(px|%|em|rem)$/,  // Acepta un tamaño de fuente con unidades opcionales.
  'text-align': /^(left|center|right|justify)$/,  // Acepta una alineación de texto.
};


export function svgValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    const svgContent: string = control.value;
    // Parse the SVG content and validate its elements and attributes here
    const isValid = validateSVG(svgContent, allowedTags, allowedAttributes, validAttributes);

    if (isValid) {
      return null;
    } else {
      return {
        svgValidator: {
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


function sanitizeSvg(svgCode: string, sanitizer: DomSanitizer): SafeHtml | null {
  try {
    const sanitizedSvg: string = DOMPurify.sanitize(svgCode, {
      ADD_TAGS: allowedTags as any,
      ADD_ATTR: allowedAttributes as any,
      WHOLE_DOCUMENT: true,
    });
    // Use bypassSecurityTrustHtml to mark the sanitized HTML as safe
    return sanitizer.bypassSecurityTrustHtml(sanitizedSvg);
  } catch (error) {
    // Handle the error here, e.g., log it or perform any necessary actions.
    console.error('Error while sanitizing SVG:', error);
    return null; // Return null or some default value in case of an error.
  }
}

function validateSVG(
  svgContent: string,
  allowedTags: string[],
  allowedAttributes: { [key: string]: string[] },
  validAttributes: { [key: string]: RegExp }
): boolean {


  if (svgContent) {
    // Check for potentially malicious elements or attributes
    if (
      svgContent.includes("<script") ||
      svgContent.includes("javascript:") ||
      svgContent.includes("data:") ||
      svgContent.includes("<iframe") ||
      svgContent.includes("<img") ||
      svgContent.includes("<a")
    ) {
      showErrorMessage('El SVG contiene atributos o valores maliciosos.');
      return false;
    }


    // Continue with the rest of your SVG validation logic here...

    return true; // Return true for now, update with your actual validation logic.
  }

  // Handle cases where there is no SVG content to validate.
  return false;
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