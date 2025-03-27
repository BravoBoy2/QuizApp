import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserQuizService } from '../../Service/user-quiz.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Quiz, Question, QuestionType } from '../../../../Shared/quiz';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, FormControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-in-quiz',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ],
  templateUrl: './in-quiz.component.html',
  styleUrls: ['./in-quiz.component.scss']
})
export class InQuizComponent implements OnInit, OnDestroy {
  quizId!: number;
  quiz = signal<Quiz | null>(null);
  questions = signal<Question[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  userId: number = 1; // This should be set from authentication service

  // Question navigation
  currentQuestionIndex = signal(0);
  currentQuestion = computed(() =>
    this.questions()[this.currentQuestionIndex()] || null
  );

  // Timer
  remainingTime = signal<number | null>(null);
  timerSubscription?: Subscription;

  // Form with reactive forms approach
  quizForm!: FormGroup;

  // Update the completionProgress calculation to use direct numeric value instead of computed
  completionProgress = computed(() => {
    const total = this.questions().length;
    if (!total) return 0;

    // Count manually each time this getter is called
    let answered = 0;
    for (let i = 0; i < this.answersArray?.length || 0; i++) {
      if (this.checkIsQuestionAnswered(i)) answered++;
    }

    console.log(`Progress calculation: ${answered}/${total} = ${(answered / total) * 100}%`);
    return (answered / total) * 100;
  });

  // Add a new signal to track progress
  progressValue = signal(0);

  // Add this debugging method to be sure the value is calculated
  getProgressValue(): number {
    return this.progressValue();
  }

  // Alternative direct method that doesn't rely on signals
  checkIsQuestionAnswered(index: number): boolean {
    if (!this.answersArray?.at(index)) return false;

    const formGroup = this.answersArray.at(index) as FormGroup;
    if (!formGroup) return false;

    const question = this.questions()[index];
    if (!question) return false;

    let isAnswered = false;

    try {
      switch(question.type) {
        case QuestionType.TEXT:
          const textAnswer = formGroup.get('textAnswer')?.value;
          isAnswered = !!textAnswer && textAnswer.trim() !== '';
          break;

        case QuestionType.SINGLE:
          isAnswered = !!formGroup.get('selectedOptionId')?.value;
          break;

        case QuestionType.MCQ:
          const optionsGroup = formGroup.get('options') as FormGroup;
          if (optionsGroup?.controls) {
            isAnswered = Object.values(optionsGroup.value || {}).some(value => value === true);
          }
          break;
      }
    } catch (error) {
      console.error("Error checking if question answered:", error);
    }

    return isAnswered;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: UserQuizService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.quizForm = this.fb.group({
      answers: this.fb.array([])
    });

    // Listen for value changes in the form to update progress
    this.quizForm.valueChanges.subscribe(() => {
      this.updateProgressValue();
    });

    this.route.params.subscribe(params => {
      this.quizId = +params['id']; // Convert to number
      this.loadQuizData();
    });

    // Get the currently logged in user's ID (ideally from an auth service)
    this.getCurrentUser();
  }

  // Add method to get current user from your authentication service
  getCurrentUser(): void {
    // Ideally this would come from your auth service
    // For example: this.userId = this.authService.getCurrentUser().id;

    // For now, we'll use a placeholder user ID until auth is implemented
    this.userId = 1; // Default user ID - replace with actual auth logic
  }

  ngOnDestroy() {
    // Clean up timer subscription
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  // Helper to access the answers FormArray
  get answersArray(): FormArray {
    return this.quizForm.get('answers') as FormArray;
  }

  loadQuizData(): void {
    this.loading.set(true);
    this.quizService.getQuizQuestions(this.quizId).subscribe({
      next: (data: any) => {
        // ...existing code for handling data...

        let quizData: Quiz | null = null;
        let questionList: Question[] = [];

        // Handle the specific API response format with separated quizTestDTO and questions
        if (data.quizTestDTO && Array.isArray(data.questions)) {
          quizData = {
            id: data.quizTestDTO.id,
            title: data.quizTestDTO.title,
            description: data.quizTestDTO.description,
            time: data.quizTestDTO.time,
            questions: data.questions || []
          };
          questionList = [...data.questions];
        } else {
          quizData = data;
          questionList = data.questions || [];
        }

        // Fix missing IDs by assigning incremental values if needed
        questionList.forEach((question, index) => {
          if (!question.id || question.id === 0) {
            question.id = index + 1; // Assign a temporary ID
          }

          // Also fix option IDs if needed
          if (question.options) {
            question.options.forEach((option, optIndex) => {
              if (!option.id || option.id === 0) {
                option.id = (index + 1) * 100 + optIndex + 1; // Create unique option IDs
              }
            });
          }
        });

        this.quiz.set(quizData);
        this.questions.set(questionList);

        // Initialize form controls based on question types
        this.initializeFormControls();

        // Set up timer if needed
        this.setupTimer();
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load quiz. Please try again.');
        console.error('Error loading quiz:', error);
        this.loading.set(false);
      }
    });
  }

  initializeFormControls(): void {
    // Clear existing form controls
    while (this.answersArray.length) {
      this.answersArray.removeAt(0);
    }

    // Create form controls for each question
    this.questions().forEach(question => {
      if (question.type === QuestionType.TEXT) {
        this.answersArray.push(this.fb.group({
          questionId: question.id,
          textAnswer: [''],
          selectedOptionIds: [null]
        }));
      } else if (question.type === QuestionType.SINGLE) {
        this.answersArray.push(this.fb.group({
          questionId: question.id,
          selectedOptionId: [null],
          textAnswer: [null]
        }));
      } else if (question.type === QuestionType.MCQ) {
        // For MCQ, create a separate FormControl for each option
        const optionControls: {[key: string]: FormControl} = {};
        question.options?.forEach(option => {
          optionControls[`option_${option.id}`] = new FormControl(false);
        });

        this.answersArray.push(this.fb.group({
          questionId: question.id,
          options: this.fb.group(optionControls),
          textAnswer: [null]
        }));
      }
    });

    // Update progress after form is initialized
    setTimeout(() => this.updateProgressValue(), 0);
  }

  setupTimer(): void {
    if (this.quiz()?.time) {
      const timeString = this.quiz()?.time;
      let totalSeconds = 0;

      // Parse time format (HH:MM:SS)
      if (typeof timeString === 'string' && timeString.includes(':')) {
        const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
        totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
      } else if (timeString !== undefined && !isNaN(Number(timeString))) {
        // If it's just a number value (like minutes)
        totalSeconds = Number(timeString) * 60;
      }

      if (totalSeconds > 0) {
        this.remainingTime.set(totalSeconds);
        this.timerSubscription = interval(1000).subscribe(() => {
          // Fix the null check - use optional chaining with nullish coalescing operator
          const currentTime = this.remainingTime() ?? 0;
          if (currentTime > 0) {
            this.remainingTime.update(time => (time ?? 0) - 1);
          } else {
            // Time's up - auto submit
            this.submitQuiz();
          }
        });
      }
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Add the missing getFormattedTime method
  getFormattedTime(time: any): string {
    if (!time) return 'No time limit';

    try {
      if (typeof time === 'string' && time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const displayHours = Math.floor(totalMinutes / 60);
        const displayMinutes = totalMinutes % 60;

        return `${displayHours} hour(s) and ${displayMinutes} minute(s)`;
      }

      if (!isNaN(Number(time))) {
        const totalMinutes = Number(time);
        const displayHours = Math.floor(totalMinutes / 60);
        const displayMinutes = totalMinutes % 60;

        return `${displayHours} hour(s) and ${displayMinutes} minute(s)`;
      }

      return String(time);
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'No time limit';
    }
  }

  // Navigation methods
  goToPreviousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(index => index - 1);
      this.updateProgressValue();
    }
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(index => index + 1);
      this.updateProgressValue();
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions().length) {
      this.currentQuestionIndex.set(index);
      this.updateProgressValue();
    }
  }

  // Improved isQuestionAnswered method for more reliable checking
  isQuestionAnswered(index: number): boolean {
    if (!this.answersArray || !this.answersArray.at(index)) return false;

    const formGroup = this.answersArray.at(index) as FormGroup;
    if (!formGroup) return false;

    const question = this.questions()[index];
    if (!question) return false;

    try {
      if (question.type === QuestionType.TEXT) {
        const textAnswer = formGroup.get('textAnswer')?.value;
        return Boolean(textAnswer && textAnswer.trim() !== '');
      } else if (question.type === QuestionType.SINGLE) {
        const selectedId = formGroup.get('selectedOptionId')?.value;
        return Boolean(selectedId); // Check if an option is selected
      } else if (question.type === QuestionType.MCQ) {
        const optionsGroup = formGroup.get('options') as FormGroup;
        if (!optionsGroup) return false;

        // Check if any checkbox is selected
        const values = Object.values(optionsGroup.value || {});
        return values.some(v => v === true);
      }
    } catch (error) {
      console.error("Error checking question answer:", error);
      return false;
    }

    return false;
  }

  // Quiz submission
  submitQuiz(): void {
    // Stop the timer if it's running
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Show a confirmation dialog before submission
    if (!confirm('Are you sure you want to submit this quiz?')) {
      return;
    }

    // Show loading indicator
    this.loading.set(true);

    // Map form data to the format expected by the API
    const responses = this.answersArray.controls.map((control, index) => {
      const formGroup = control as FormGroup;
      const question = this.questions()[index];

      if (question.type === QuestionType.TEXT) {
        // Get exact text answer and log for debugging
        const rawTextAnswer = formGroup.get('textAnswer')?.value || '';
        const textAnswer = rawTextAnswer.trim();

        console.log(`Question ${question.id} (TEXT): "${question.questionText}"`);
        console.log(`Submitting answer: "${textAnswer}"`);
        console.log(`Expected answer: "${question.correctAnswer}"`);

        return {
          questionId: question.id,
          selectedOptionIds: [], // Always empty array for TEXT questions
          textAnswer: textAnswer // Send the trimmed answer
        };
      } else if (question.type === QuestionType.SINGLE) {
        return {
          questionId: question.id,
          selectedOptionIds: formGroup.get('selectedOptionId')?.value ? [formGroup.get('selectedOptionId')?.value] : [],
          textAnswer: ''
        };
      } else if (question.type === QuestionType.MCQ) {
        // Extract selected options from the options form group
        const optionsGroup = formGroup.get('options') as FormGroup;
        const selectedIds: number[] = [];

        if (optionsGroup) {
          Object.entries(optionsGroup.value).forEach(([key, value]) => {
            if (value === true) {
              // Extract the option ID from the 'option_X' format
              const optionId = Number(key.split('_')[1]);
              selectedIds.push(optionId);
            }
          });
        }

        return {
          questionId: question.id,
          selectedOptionIds: selectedIds,
          textAnswer: ''
        };
      }

      // Default return for safety
      return {
        questionId: question.id,
        selectedOptionIds: [],
        textAnswer: ''
      };
    });

    // Log the entire payload for debugging
    console.log('Full submission payload:', JSON.stringify({
      quizId: this.quizId,
      userId: this.userId,
      answers: responses
    }, null, 2));

    // Call the API with the correct user ID
    this.quizService.submitQuiz(this.quizId, this.userId, responses).subscribe({
      next: (result) => {
        console.log('Quiz submission result:', result);
        this.loading.set(false);
        this.snackBar.open(`Quiz submitted successfully! You scored ${result.percentageCorrAnswer.toFixed(1)}%`, 'Close', {
          duration: 5000
        });
        this.router.navigate(['/user/quiz-results', this.quizId]);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Failed to submit quiz:', err);
        this.snackBar.open('Failed to submit quiz: ' + (err.error || err.message || 'Unknown error'), 'Close', {
          duration: 5000
        });
      }
    });
  }

  // Add a method to show the submit quiz button at any time
  showSubmitButton(): boolean {
    // Show if at least one question has been answered
    return this.answersArray.controls.some((control, index) =>
      this.isQuestionAnswered(index)
    );
  }

  goBackToDashboard(): void {
    // Show confirmation if answers have been entered
    if (this.answersArray.controls.some((control, index) => this.isQuestionAnswered(index))) {
      const confirm = window.confirm('Are you sure you want to exit? Your progress will be lost.');
      if (!confirm) return;
    }

    this.router.navigate(['/user/dashboard']);
  }

  // Make this method more efficient
  getAnsweredCount(): number {
    if (!this.answersArray) return 0;

    // Calculate once and store for efficiency
    let count = 0;
    const length = this.answersArray.length;

    for (let i = 0; i < length; i++) {
      if (this.isQuestionAnswered(i)) {
        count++;
      }
    }

    return count;
  }

  getProgressColor(): string {
    const progress = this.completionProgress();
    // Use standard Material theme colors
    if (progress < 40) return 'warn';     // Red for beginning
    if (progress < 85) return 'primary';  // Default primary (usually blue or purple)
    return 'accent';                      // Accent for nearly complete (usually pink/orange)
  }

  // Add a function to directly update progress value when needed
  updateProgressValue(): void {
    const total = this.questions().length;
    if (!total) return;

    let count = 0;
    for (let i = 0; i < this.answersArray.length; i++) {
      if (this.checkIsQuestionAnswered(i)) {
        count++;
      }
    }

    const percentage = Math.round((count / total) * 100);
    console.log(`Updating progress: ${count} / ${total} = ${percentage}%`);
    this.progressValue.set(percentage);
  }
}
