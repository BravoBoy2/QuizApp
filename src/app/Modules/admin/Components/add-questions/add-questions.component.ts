import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../Services/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Option, QuestionType } from '../../Services/quiz';

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './add-questions.component.html',
  styleUrl: './add-questions.component.scss'
})
export class AddQuestionsComponent implements OnInit {
  quizId: number | null = null;
  questionTypes = [
    { value: QuestionType.MCQ, display: 'Multiple Choice' },
    { value: QuestionType.SINGLE, display: 'Single Select' },
    { value: QuestionType.TEXT, display: 'Text Input' }
  ];

  addQuestion = new FormGroup({
    questionText: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(255)
    ]),
    type: new FormControl(QuestionType.MCQ, [Validators.required]),
    options: new FormArray([]),
    correctAnswer: new FormControl('')
  });

  constructor(
    private router: Router,
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.quizId = +params['id']; // Convert to number

      // Add initial option fields for MCQ
      this.addOption();
      this.addOption();
    });

    // Listen for question type changes
    this.addQuestion.get('type')?.valueChanges.subscribe(type => {
      this.handleTypeChange(type as QuestionType);
    });
  }

  // Get options as FormArray for template access
  get options() {
    return this.addQuestion.get('options') as FormArray;
  }

  // Handle question type changes
  handleTypeChange(type: QuestionType) {
    const optionsArray = this.addQuestion.get('options') as FormArray;
    const correctAnswerControl = this.addQuestion.get('correctAnswer');

    // Clear all options
    while (optionsArray.length) {
      optionsArray.removeAt(0);
    }

    if (type === QuestionType.MCQ || type === QuestionType.SINGLE) {
      // Add at least two options for MCQ and Single Select
      this.addOption();
      this.addOption();
      correctAnswerControl?.setValue('');
      correctAnswerControl?.clearValidators();
      correctAnswerControl?.updateValueAndValidity();
    } else if (type === QuestionType.TEXT) {
      // For text input, we need the correct answer
      correctAnswerControl?.setValidators([Validators.required]);
      correctAnswerControl?.updateValueAndValidity();
    }
  }

  // Add a new option
  addOption() {
    const optionGroup = new FormGroup({
      answerText: new FormControl('', [Validators.required]),
      isCorrect: new FormControl(false)
    });

    this.options.push(optionGroup);
  }

  // Remove an option
  removeOption(index: number) {
    this.options.removeAt(index);
  }

  // Handle option selection for single select type
  onOptionSelect(index: number) {
    if (this.addQuestion.get('type')?.value === QuestionType.SINGLE) {
      // Ensure only one option is selected for single select
      for (let i = 0; i < this.options.length; i++) {
        const option = this.options.at(i);
        option.get('isCorrect')?.setValue(i === index);
      }
    }
  }

  // Submit question
  onSubmit() {
    if (this.addQuestion.valid && this.quizId) {
      let questionData: any = {
        questionText: this.addQuestion.get('questionText')?.value,
        type: this.addQuestion.get('type')?.value,
        quiz: { id: this.quizId }
      };

      if (this.addQuestion.get('type')?.value === QuestionType.TEXT) {
        questionData.correctAnswer = this.addQuestion.get('correctAnswer')?.value;
        questionData.options = [];
      } else {
        questionData.options = (this.addQuestion.get('options') as FormArray).controls.map(
          control => ({
            answerText: control.get('answerText')?.value,
            isCorrect: control.get('isCorrect')?.value
          })
        );
        questionData.correctAnswer = '';
      }

      console.log('Submitting question data:', questionData);

      // Updated to use the correct method with both parameters
      this.adminService.addQuestionToQuiz(this.quizId, [questionData]).subscribe({
        next: (response : any) => {
          console.log('Success response:', response);
          this.snackBar.open('Question added successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom'
          });
          this.addQuestion.reset();
          this.addQuestion.get('type')?.setValue(QuestionType.MCQ);
          // Reset form for next question or navigate based on your requirement
        },
        error: (error: any) => {
          console.error('Full error details:', error);
          let errorMessage = 'Failed to add question. Please try again.';
          if (error.error && typeof error.error === 'string') {
            errorMessage += ' Server says: ' + error.error;
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            verticalPosition: 'bottom'
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.addQuestion);
    }
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          if (control.at(i) instanceof FormGroup) {
            this.markFormGroupTouched(control.at(i) as FormGroup);
          } else {
            control.at(i).markAsTouched();
          }
        }
      }
    });
  }

  // Return to dashboard
  finish() {
    this.router.navigate(['/admin/dashboard']);
  }
}
