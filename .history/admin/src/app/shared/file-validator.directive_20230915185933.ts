// @Component({
//   selector: 'app-file-upload',
//   templateUrl: './file-upload.component.html'
// })
// export class FileUploadComponent {
//   @Input() progress;

//   private file: File | null = null;

//   @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
//     const file = event && event.item(0);
//     this.file = file;
//   }

//   constructor() {
//   }
// }