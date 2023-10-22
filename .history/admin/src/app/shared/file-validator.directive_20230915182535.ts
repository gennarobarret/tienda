import { AsyncValidatorFn } from '@angular/forms';

export function isImageValidator(control: FormControl): AsyncValidatorFn {
  return async () => {
    const file = control.value;
    if (!file) {
      return null;
    }

    const mimeType = file.type;
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    return allowedMimeTypes.includes(mimeType);
  };
}