import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogTitle} from '@angular/material/dialog';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {AdminService} from '../../Services/admin.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';



@Component({
  selector: 'app-create-quiz',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogTitle,
    MatTimepickerModule,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-quiz.component.html',
  styleUrl: './create-quiz.component.scss'
})
export class CreateQuizComponent {

  private snackBar = inject(MatSnackBar);

  createQuiz = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(6)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    time: new FormControl('', [Validators.required]),
  });

  constructor(private adminService: AdminService, private router: Router) {
  }
  openSnackbar(message: string, action: string = 'Close', duration: number = 3000) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  submitQuiz() {
    if (this.createQuiz.valid) {
      let formData = this.createQuiz.value;

      //date format
      formData.time = formData.time + ":00";
      this.adminService.createQuizTest('quiz', formData)
        .subscribe({
          next: (response : any)=> {

            this.openSnackbar(`Quiz: "${response.title}" has been created`, "close", 3000);
            setTimeout(()=>{
              this.createQuiz.reset();
              this.router.navigate(['admin/dashboard']);

            }, 2000);
          },
      error: (error)=> {
            console.error(error);
            this.openSnackbar( error.message, "try again", 5000);
      }
  });
    }
  }

  formatTime(time: string | null): string {
    if (!time) {
      return "00:10:00"; // Default to 00:00:00 if time is null or empty
    }

    if (!time.includes(":")){
      return time + ":00:00";
    } else if (time.split(":").length === 2){
      return time + ":00";
    } else {
      return time;
    }
  }

  displayError(controlName:string): boolean {
    const control = this.createQuiz.get(controlName);
    return Boolean(control?.invalid) && Boolean(control?.touched);
  }



}
