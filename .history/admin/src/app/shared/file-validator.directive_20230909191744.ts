import { Directive, HostListener, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

declare let iziToast: any;

function showErrorMessage(message: string) {
  iziToast.show({
    title: 'ERROR',
    titleColor: '#FF0000',
    color: '#FFF',
    class: 'text-danger',
    position: 'topRight',
    message: message,
  });
}

const allowedTypes: string[] = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];
const maxSize: number = 4000000; // Tamaño máximo en bytes (4MB)

export function fileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fileContent: File = control.value; ç

    console.log(fileContent);

    if (!fileContent) {
      // No se seleccionó ningún archivo
      return null;
    }

    // Comprobar tipo de archivo
    if (!allowedTypes.includes(fileContent.type)) {
      // Tipo de archivo no permitido
      return {
        fileValidator: {
          valid: false,
          message: 'El archivo debe ser una imagen PNG, WEBP, JPG, GIF o JPEG.',
        },
      };
    }

    // Comprobar tamaño de archivo
    if (fileContent.size > maxSize) {
      // Tamaño de archivo excede el límite
      return {
        fileValidator: {
          valid: false,
          message: 'La imagen no puede superar los 4MB',
        },
      };
    }

    // Todas las validaciones pasaron
    return null;
  };
}

@Directive({
  selector: '[appFileValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: FileValidatorDirective,
      multi: true,
    },
  ],
})
export class FileValidatorDirective implements Validator {
  @Input() maxSize: number = 4000000; // Tamaño máximo en bytes (4MB)
  @Input() allowedTypes: string[] = allowedTypes;

  constructor() { }

  @HostListener('change', ['$event'])
  onChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      // No se seleccionó ningún archivo
      return;
    }

    const validationResult = fileValidator()(file);

    if (validationResult) {
      // Mostrar mensaje de error si la validación falla
      showErrorMessage(validationResult['fileValidator'].message);
    } else {
      // Todas las validaciones pasaron, puedes procesar el archivo aquí si es necesario
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const imageUrl = reader.result as string;
        // Haz lo que necesites con la imagen (por ejemplo, mostrarla en la vista)
      };
    }
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    return fileValidator()(control);
  }
}
