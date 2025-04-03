import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-quit-quiz-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Quit</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Quit</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      font-size: 16px;
    }
    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class QuitQuizDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<QuitQuizDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
