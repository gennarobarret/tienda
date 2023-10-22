import { AbstractControl } from '@angular/forms';

export function ValidateSvg(control: AbstractControl) {
    if (!control.value.startsWith('https') || !control.value.includes('.io')) {
        return { invalidUrl: true };
    }
    return null;
}