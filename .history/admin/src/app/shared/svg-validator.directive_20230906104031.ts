import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import DOMPurify from "dompurify";



export function svgValidator(): ValidatorFn {
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

  return (control: AbstractControl): ValidationErrors | null => {
    const svgContent: string = control.value;

    if (svgContent) {
      // Verifica la presencia de elementos o atributos potencialmente maliciosos.
      if (
        svgCode.includes("<script") ||
        svgCode.includes("javascript:") ||
        svgCode.includes("data:") ||
        svgCode.includes("<iframe") ||
        svgCode.includes("<img") ||
        svgCode.includes("<a")
      ) {
        this.showErrorMessage('El SVG contiene atributos o valores maliciosos.');
        this.trustedSvg = '';
        return { invalidSVG: true };
      }




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

  function validateSVG(
    svgContent: string,
    allowedTags: string[],
    allowedAttributes: { [key: string]: string[] },
    validAttributes: { [key: string]: RegExp }
  ): boolean {


    // Analiza el código SVG utilizando un parser XML.
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgCode, "text/xml");
    const svgElement = xmlDoc.querySelector("svg");


    // Verifica la existencia de un elemento "svg" válido.
    if (!svgElement) {
      this.showErrorMessage('No se encontró un elemento "svg" válido en el SVG proporcionado.');
      this.trustedSvg = '';
      return { invalidSVG: true };
    }

    // Verifica si el código SVG termina correctamente con "</svg>".
    if (!svgCode.endsWith("</svg>")) {
      this.showErrorMessage('Falta el cierre de la etiqueta "</svg>" en el SVG proporcionado.');
      this.trustedSvg = '';
      return { invalidSVG: true };
    }

    // Verifica la etiqueta de cierre "/>" en los elementos "<path>".
    const pathElements = svgCode.match(/<path[^>]*>/g);
    if (pathElements) {
      for (const pathElement of pathElements) {
        if (!pathElement.endsWith("/>")) {
          this.showErrorMessage('Falta la etiqueta de cierre "/>" en un elemento "<path>" en el SVG proporcionado.');
          this.trustedSvg = '';
          return { invalidSVG: true };
        }
      }
    }

    // Obtiene las etiquetas y atributos del elemento "svg".
    const svgTags: string[] = Array.from(svgElement.children).map((el) => el.tagName);
    const svgAttributes: string[] = Array.from(svgElement.attributes).map((attr) => attr.name);

    // Valida los atributos del elemento "svg".
    const svgValidAttributes: Attr[] = Array.from(svgElement.attributes);
    for (const attr of svgValidAttributes) {
      const attributeName = attr.name;
      const attributeValue = attr.value;

      if (this.validAttributes.hasOwnProperty(attributeName)) {
        const attributePattern = this.validAttributes[attributeName];
        if (!attributePattern.test(attributeValue)) {
          const errorMessage = `El atributo "${attributeName}" contiene caracteres no permitidos: "${attributeValue}"`;
          this.showErrorMessage(errorMessage);
          this.trustedSvg = '';
          return { [`${attributeName}Invalid`]: true };
        }
      }
    }

    // Verifica las etiquetas no permitidas en el SVG.
    const invalidTags = svgTags.filter((tag) => !tallowedTags.includes(tag));
    if (invalidTags.length > 0) {
      const errorMessage = `Etiquetas no permitidas en el SVG: ${invalidTags.join(", ")}`;



    }

    // Verifica los atributos no permitidos en el elemento "svg".
    const invalidAttributes = svgAttributes.filter(
      (attr) => !this.allowedAttributes[svgElement.tagName].includes(attr)
    );

    if (invalidAttributes.length > 0) {
      const errorMessage = `Atributos no permitidos en el elemento "${svgElement.tagName}": ${invalidAttributes.join(", ")}`;
      this.showErrorMessage(errorMessage);
      this.trustedSvg = '';
      return { invalidSVG: true };
    }

  }
  // Implement your SVG validation logic here
  // You need to parse the SVG content, check if it contains allowed tags,
  // and validate the attributes based on the provided patterns.
  // Return true if the SVG is valid, otherwise return false.

  // Example pseudocode for validation:
  // 1. Parse the SVG content.
  // 2. Check if the parsed elements are allowed.
  // 3. For each element, validate its attributes using the corresponding patterns.

  // Replace this pseudocode with your actual validation logic.

  return true; // Return true for now, update with actual validation logic.
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
