import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatProgressSpinnerModule,
    MatDialogTitle
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  // formatJson method to format JSON data for better readability
  formatJson(arg0: any) {
    throw new Error('Method not implemented.');
  }
  // data variable to inject dialog data
  data = inject(MAT_DIALOG_DATA);
  // loading = contentChild<boolean>("loading");


}
