import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fileValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {


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


fileChangeEvent(event: any) {

  this.file = event.target.files && event.target.files[0];
  //     let reader = new FileReader(); // HTML5 FileReader API
  //     let file = event.target.files[0];

  //     if (event.target.files && event.target.files[0]) {
  //         if (
  //             file.type == 'image/png' ||
  //             file.type == 'image/webp' ||
  //             file.type == 'image/jpg' ||
  //             file.type == 'image/gif' ||
  //             file.type == 'image/jpeg'
  //         ) {
  //             if (file.size <= 4000000) {
  //                 reader.readAsDataURL(file);

  //                 // When file uploads, set it to file form control
  //                 reader.onload = () => {
  //                     this.imageUrl = reader.result;
  //                     this.categoriaForm.patchValue({
  //                         file: reader.result
  //                     });
  //                     this.editFile = false;
  //                     this.removeUpload = true;
  //                 }

  //                 // ChangeDetectorRef since the file is loading outside the zone
  //                 this.cd.markForCheck();

  //                 // Return a value (e.g., null) to indicate success
  //                 return null;

  //             } else {
  //                 console.log('La imagen no puede superar los 4MB');
  //                 this.showErrorMessage('La imagen no puede superar los 4MB');
  //                 return { invalidFileSize: true }; // Invalid file size
  //             }
  //         } else {
  //             console.log('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
  //             this.showErrorMessage('El archivo debe ser una imagen PNG, WEBP, JPG, GIF, or JPEG.');
  //             return { invalidFileType: true }; // Invalid file type
  //         }
  //     } else {
  //         console.log('No hay una imagen para enviar');
  //         this.showErrorMessage('Invalid file type');
  //         return { required: true }; // required file
  //     }
}


// Function to remove uploaded file
funtion removeUploadedFile() {
  if (this.fileInput) {
    const files = this.fileInput.nativeElement.files;
    if (files) {
      let newFileList = Array.from(files);
      this.imageUrl = 'assets/img/default.jpg';
      this.editFile = true;
      this.removeUpload = false;
      this.categoriaForm.patchValue({
        file: [null]
      });
    } else {
      console.error('No files selected.');
    }
  } else {
    console.error('fileInput is undefined.');
  }
}


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
