import { Directive, HostListener, Input } from '@angular/core';
declare let iziToast: any;

@Directive({
  selector: '[appFileValidator]'
})




export class FileValidatorDirective {
  @Input() maxSize: number = 4000000; // Tamaño máximo en bytes (4MB)
  @Input() allowedTypes: string[] = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];

  constructor() { }

  @HostListener('change', ['$event'])
  onChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      // No se seleccionó ningún archivo
      return;
    }

    if (!this.allowedTypes.includes(file.type)) {
      // Tipo de archivo no permitido
      console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, o JPEG.');
      return;
    }

    if (file.size > this.maxSize) {
      // Tamaño de archivo excede el límite
      console.log('La imagen no puede superar los 4MB');
      return;
    }

    // Todas las validaciones pasaron, puedes procesar el archivo aquí si es necesario
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const imageUrl = reader.result as string;
      // Haz lo que necesites con la imagen (por ejemplo, mostrarla en la vista)
    };
  }

  showErrorMessage(message: string) {
    iziToast.show({
      title: "ERROR",
      titleColor: "#FF0000",
      color: "#FFF",
      class: "text-danger",
      position: "topRight",
      message: message,
    });
  }
}
