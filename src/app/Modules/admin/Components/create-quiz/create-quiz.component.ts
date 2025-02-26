import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogTitle} from '@angular/material/dialog';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {range} from 'rxjs';



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

  createQuiz = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    time: new FormControl('', [Validators.required]),
  });

  constructor() {
  }

  submitQuiz() {
    return null;
  }

  displayError(controlName:string): boolean {
    const control = this.createQuiz.get(controlName);
    return Boolean(control?.invalid) && Boolean(control?.touched);
  }

  protected readonly range = range;
}
