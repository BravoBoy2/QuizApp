import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../Services/admin.service';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { QuestionType } from '../../../../Shared/quiz';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatFormFieldModule,
    MatRadioModule
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

  // For debugging
  get debugCurrentQuestionType(): string {
    if (this.questionForms.length === 0 || this.expandedQuestionIndex >= this.questionForms.length) {
      return 'None';
    }
    return this.questionForms[this.expandedQuestionIndex].get('type')?.value || 'Unknown';
  }

  // Array to track multiple questions
  questionForms: FormGroup[] = [];
  // Track which panel is expanded
  expandedQuestionIndex = 0;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef for manual change detection
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.quizId = +params['id']; // Convert to number

      // Initialize with one question
      this.addNewQuestion();
    });
  }

  // Create a new question form
  createQuestionForm(): FormGroup {
    const form = new FormGroup({
      questionText: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(255)
      ]),
      type: new FormControl(QuestionType.MCQ, [Validators.required]),
      options: new FormArray([]),
      correctAnswer: new FormControl('')
    });

    // Add initial options
    const optionsArray = form.get('options') as FormArray;
    // Add two options by default
    for (let i = 0; i < 2; i++) {
      optionsArray.push(new FormGroup({
        answerText: new FormControl('', [Validators.required]),
        isCorrect: new FormControl(i === 0) // First option is correct by default
      }));
    }

    // Listen for question type changes
    form.get('type')?.valueChanges.subscribe(type => {
      this.handleTypeChange(form, type as QuestionType);
    });

    return form;
  }

  // Add a new question
  addNewQuestion() {
    // First collapse all existing questions
    this.expandedQuestionIndex = this.questionForms.length;

    // Create and add the new form
    const newForm = this.createQuestionForm();
    this.questionForms.push(newForm);
  }

  // Remove a question
  removeQuestion(index: number) {
    this.questionForms.splice(index, 1);
    if (this.questionForms.length === 0) {
      // If we removed all questions, add one back
      this.addNewQuestion();
    } else if (this.expandedQuestionIndex === index) {
      // If we removed the currently expanded panel, expand the last one
      this.expandedQuestionIndex = this.questionForms.length - 1;
    } else if (this.expandedQuestionIndex > index) {
      // Adjust the expanded index if we removed a panel before it
      this.expandedQuestionIndex--;
    }
  }

  // Set which question is expanded
  setExpandedIndex(index: number) {
    this.expandedQuestionIndex = index;
  }

  // Get options as FormArray for a specific question form
  getOptions(form: FormGroup): FormArray {
    return form.get('options') as FormArray;
  }

  // Handle question type changes - removed redundant logs
  handleTypeChange(form: FormGroup, type: QuestionType) {
    // Keep single log for better debugging
    console.log('Question type changed to:', type);

    // Start fresh with options
    const optionsArray = form.get('options') as FormArray;
    const correctAnswerControl = form.get('correctAnswer');

    // Clear all options
    while (optionsArray.length) {
      optionsArray.removeAt(0);
    }

    if (type === QuestionType.MCQ || type === QuestionType.SINGLE) {
      // Add options with proper default values
      for (let i = 0; i < 2; i++) {
        const isCorrect = type === QuestionType.SINGLE ? i === 0 : false;
        const optionGroup = new FormGroup({
          answerText: new FormControl('', [Validators.required]),
          isCorrect: new FormControl(isCorrect)
        });
        optionsArray.push(optionGroup);
      }

      // Clear text answer
      correctAnswerControl?.clearValidators();
      correctAnswerControl?.setValue('');
      correctAnswerControl?.updateValueAndValidity();
    } else if (type === QuestionType.TEXT) {
      // Text question needs a correct answer
      correctAnswerControl?.setValidators([Validators.required]);
      correctAnswerControl?.updateValueAndValidity();
    }

    // Force form validation update
    form.updateValueAndValidity({ emitEvent: true });
    this.cdr.detectChanges();
  }

  // Add a new option to a specific question
  addOption(form: FormGroup) {
    const optionsArray = form.get('options') as FormArray;
    optionsArray.push(new FormGroup({
      answerText: new FormControl('', [Validators.required]),
      isCorrect: new FormControl(false)
    }));
  }

  // Remove an option from a specific question
  removeOption(form: FormGroup, index: number) {
    const optionsArray = form.get('options') as FormArray;

    // If we're removing the only correct option for a SINGLE type question,
    // make sure to select another option as correct
    if (form.get('type')?.value === QuestionType.SINGLE) {
      const optionToRemove = optionsArray.at(index) as FormGroup;
      if (optionToRemove.get('isCorrect')?.value === true && optionsArray.length > 1) {
        // Find the next available option and make it correct
        const newCorrectIndex = index === 0 ? 1 : 0;
        const newCorrectOption = optionsArray.at(newCorrectIndex) as FormGroup;
        newCorrectOption.get('isCorrect')?.setValue(true);
      }
    }

    optionsArray.removeAt(index);
  }

  // Handle selecting an option for SINGLE question type - removed redundant logs
  selectOption(form: FormGroup, index: number) {
    if (form.get('type')?.value !== 'SINGLE') return;

    const optionsArray = form.get('options') as FormArray;

    // Store all current text values before changing isCorrect values
    const textValues = optionsArray.controls.map(control =>
      (control as FormGroup).get('answerText')?.value
    );

    // Set all options to not selected
    optionsArray.controls.forEach((option, i) => {
      const optionGroup = option as FormGroup;

      // First preserve the text value
      const currentText = textValues[i];

      // Then update isCorrect
      optionGroup.get('isCorrect')?.setValue(false, { onlySelf: true, emitEvent: false });

      // Then restore the text value
      if (currentText) {
        optionGroup.get('answerText')?.setValue(currentText, { onlySelf: true, emitEvent: false });
      }
    });

    // Set the selected option to true
    const selectedOption = optionsArray.at(index) as FormGroup;

    // Preserve text for the selected option too
    const selectedText = textValues[index];

    // Update isCorrect
    selectedOption.get('isCorrect')?.setValue(true, { onlySelf: true, emitEvent: false });

    // Restore the text value
    if (selectedText) {
      selectedOption.get('answerText')?.setValue(selectedText, { onlySelf: true, emitEvent: false });
    }

    // Manually validate the form after all changes
    form.updateValueAndValidity();

    // Force change detection
    this.cdr.detectChanges();
  }

  // Updated method to handle input events in a type-safe way
  updateOptionText(form: FormGroup, index: number, event: Event) {
    // Get the target input element and safely cast it
    const target = event.target as HTMLInputElement;
    const text = target.value;

    const optionsArray = form.get('options') as FormArray;
    const option = optionsArray.at(index) as FormGroup;

    // Preserve the isCorrect state
    const isCorrect = option.get('isCorrect')?.value;

    // Update the text
    option.get('answerText')?.setValue(text, { onlySelf: true, emitEvent: false });

    // Ensure isCorrect state is preserved
    option.get('isCorrect')?.setValue(isCorrect, { onlySelf: true, emitEvent: false });

    // Update form validity
    form.updateValueAndValidity();
  }

  // Completely revised areAllFormsValid with fewer logs
  areAllFormsValid(): boolean {
    try {
      return this.questionForms.every(form => {
        // Basic validation for question text
        if (!form.get('questionText')?.valid) {
          return false;
        }

        const type = form.get('type')?.value;

        // TEXT type validation
        if (type === 'TEXT') {
          const correctAnswer = form.get('correctAnswer')?.value;
          if (!correctAnswer) {
            return false;
          }
          return true;
        }

        // MCQ and SINGLE type validation
        const optionsArray = form.get('options') as FormArray;

        // Must have enough options
        if (optionsArray.length < 2) {
          return false;
        }

        // Check option texts - removed excessive logging
        const optionTexts = [];
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray.at(i) as FormGroup;
          const text = option.get('answerText')?.value;

          if (!text || text.trim() === '') {
            optionTexts.push(`Option ${i+1} requires text`);
          }
        }

        if (optionTexts.length > 0) {
          return false;
        }

        // Check for correct selection
        let correctCount = 0;
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray.at(i) as FormGroup;
          if (option.get('isCorrect')?.value === true) {
            correctCount++;
          }
        }

        if (correctCount === 0) {
          return false;
        }

        if (type === 'SINGLE' && correctCount !== 1) {
          return false;
        }

        return true;
      });
    } catch (error) {
      console.error('Error in validation:', error);
      return false;
    }
  }

  // Check if a specific form has valid options based on its type
  hasValidOptions(form: FormGroup): boolean {
    const questionType = form.get('type')?.value;

    if (questionType === 'TEXT') {
      return !!form.get('correctAnswer')?.value;
    } else if (questionType === 'MCQ') {
      const options = this.getOptions(form).controls;
      return options.some(option => option.get('isCorrect')?.value === true) &&
             options.every(option => !!option.get('answerText')?.value) &&
             options.length >= 2;
    } else if (questionType === 'SINGLE') {
      // For SINGLE type, exactly one option must be selected
      const options = this.getOptions(form).controls;

      // Check if:
      // 1. At least two options exist
      // 2. All options have text
      // 3. Exactly one option is marked as correct
      return options.length >= 2 &&
             options.every(option => !!option.get('answerText')?.value) &&
             options.filter(option => option.get('isCorrect')?.value === true).length === 1;
    }

    return false;
  }

  // Simplified utility method to check if any option is correct
  hasAnyCorrectOption(form: FormGroup): boolean {
    const optionsArray = form.get('options') as FormArray;
    if (!optionsArray) return false;

    // Directly check each option's isCorrect value
    for (let i = 0; i < optionsArray.length; i++) {
      const option = optionsArray.at(i) as FormGroup;
      if (option.get('isCorrect')?.value === true) {
        return true;
      }
    }
    return false;
  }

  // Submit all questions - simplified logging
  onSubmit() {
    if (!this.areAllFormsValid()) {
      this.markAllFormsTouched();
      this.snackBar.open('Please fix all validation errors before submitting.', 'Close', {
        duration: 3000
      });
      return;
    }

    const allQuestionData = this.prepareAllQuestionData();
    this.submitQuestionsToServer(allQuestionData);
  }

  private markAllFormsTouched() {
    this.questionForms.forEach(form => {
      form.markAllAsTouched();
      const optionsArray = form.get('options') as FormArray;
      for (let i = 0; i < optionsArray.length; i++) {
        (optionsArray.at(i) as FormGroup).markAllAsTouched();
      }
    });
  }

  private prepareAllQuestionData(): any[] {
    return this.questionForms.map(form => {
      const questionData: any = {
        questionText: form.get('questionText')?.value,
        type: form.get('type')?.value,
        quiz: { id: this.quizId }
      };

      const questionType = form.get('type')?.value;

      if (questionType === QuestionType.TEXT) {
        questionData.correctAnswer = form.get('correctAnswer')?.value;
        questionData.options = [];
      } else {
        questionData.options = this.getOptionsFromForm(form);
        questionData.correctAnswer = '';
      }

      return questionData;
    });
  }

  private getOptionsFromForm(form: FormGroup): any[] {
    const optionsArray = form.get('options') as FormArray;

    // Removed redundant logging of raw options array

    const mappedOptions = optionsArray.controls.map((control, index) => {
      const formGroup = control as FormGroup;
      const answerText = formGroup.get('answerText')?.value;
      const isCorrect = formGroup.get('isCorrect')?.value;

      // Keep warning for empty option text as it's useful for debugging
      if (!answerText) {
        console.warn(`Warning: Empty text for option ${index}`);
      }

      return {
        answerText: answerText || '', // Ensure it's at least an empty string
        isCorrect: isCorrect === true // Ensure boolean value
      };
    });

    return mappedOptions;
  }

  private submitQuestionsToServer(questionDataList: any[]): void {
    this.adminService.addQuestionToQuiz(this.quizId as number, questionDataList).subscribe({
      next: (response) => {
        this.snackBar.open(`${questionDataList.length} question(s) added successfully!`, 'Close', {
          duration: 3000,
          verticalPosition: 'bottom'
        });

        // Reset by clearing all forms and adding a new empty one
        this.questionForms = [];
        this.addNewQuestion();
      },
      error: (error) => {
        console.error('Failed to submit questions:', error);
        let errorMessage = 'Failed to add questions. Please try again.';
        if (error.error && typeof error.error === 'string') {
          errorMessage += ' Server says: ' + error.error;
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
      }
    });
  }

  // Return to dashboard
  finish() {
    this.router.navigate(['/admin/dashboard']);
  }
}
