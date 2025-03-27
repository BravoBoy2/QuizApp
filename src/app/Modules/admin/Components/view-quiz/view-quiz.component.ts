import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../Services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuestionType, Quiz, Question, Option } from '../../../../Shared/quiz';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-view-quiz',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './view-quiz.component.html',
  styleUrls: ['./view-quiz.component.scss']
})
export class ViewQuizComponent {
  quizId: number = 0;
  quiz: Quiz | null = null;  // Changed from any to Quiz
  questions: Question[] = []; // Changed from any[] to Question[]
  loading = signal(true);
  error: string | null = null;

  // Filter properties
  searchText: string = '';
  selectedType: string = '';
  questionTypes = [
    { value: '', display: 'All Types' },
    { value: QuestionType.MCQ, display: 'Multiple Choice' },
    { value: QuestionType.SINGLE, display: 'Single Select' },
    { value: QuestionType.TEXT, display: 'Text Input' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.quizId = +params['id']; // Convert to number
      this.loadQuizData();
    });
  }

  // Improved getFormattedTime method to handle undefined values
  getFormattedTime(time: any): string {
    // If time is undefined, display default message
    if (time === undefined || time === null) {
      console.log('Time is undefined or null');
      return 'No time limit';
    }

    console.log('Raw time value:', time, typeof time);

    try {
      // If it's already a string like "HH:MM"
      if (typeof time === 'string' && time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const displayHours = Math.floor(totalMinutes / 60);
        const displayMinutes = totalMinutes % 60;

        return `${displayHours} hour(s) and ${displayMinutes} minute(s)`;
      }

      // If it's a number or can be converted to a number (represents minutes)
      if (!isNaN(Number(time))) {
        const totalMinutes = Number(time);
        const displayHours = Math.floor(totalMinutes / 60);
        const displayMinutes = totalMinutes % 60;

        return `${displayHours} hour(s) and ${displayMinutes} minute(s)`;
      }

      // If we get here, just return the original value
      return String(time);
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'No time limit';
    }
  }

  loadQuizData(): void {
    this.loading.set(true);
    this.adminService.getQuizQuestions(this.quizId).subscribe({
      next: (data: any) => {
        console.log('Complete API response:', JSON.stringify(data, null, 2));

        // Extract quiz data from the nested structure
        if (data.quizTestDTO) {
          console.log('Found quiz data in quizTestDTO:', data.quizTestDTO);

          // Set up the quiz object with data from quizTestDTO
          this.quiz = {
            id: data.quizTestDTO.id,
            title: data.quizTestDTO.title,
            description: data.quizTestDTO.description,
            time: data.quizTestDTO.time,
            questions: data.questions || []
          };

          // Store questions from the root level
          this.questions = data.questions || [];

          // Print all questions and options for debugging
          this.questions.forEach((question, qIndex) => {
            console.log(`Question ${qIndex + 1}: ${question.questionText}`);
            if (question.options && question.options.length > 0) {
              question.options.forEach((option, oIndex) => {
                // The API uses 'correct' instead of 'isCorrect'
                console.log(`  Option ${oIndex + 1}: ${option.answerText}, correct=${option.isCorrect}`);
              });
            }
          });

          console.log('Time from quizTestDTO:', this.quiz.time);
        } else {
          // Fallback to the original approach if structure is different
          this.quiz = data;
          this.questions = data.questions || [];
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.error = 'Failed to load quiz data.';
        console.error('Error loading quiz:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load quiz. Please try again.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom'
        });
      }
    });
  }

  // Method to add more questions to the quiz
  addMoreQuestions(): void {
    this.router.navigate(['/admin/add-questions', this.quizId]);
  }

  // Method to edit the quiz
  editQuiz(): void {
    this.router.navigate(['/admin/edit-quiz', this.quizId]);
  }

  // Method to delete the quiz
  deleteQuiz(): void {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      // Implement deletion logic here
      // For now, just simulate deletion and navigate back
      this.snackBar.open('Quiz deletion is not implemented yet.', 'Close', {
        duration: 3000
      });
      // this.router.navigate(['/admin/dashboard']);
    }
  }

  // Filter questions based on search text and type
  get filteredQuestions(): any[] {
    return this.questions.filter(q => {
      // Filter by text search
      const textMatch = !this.searchText ||
        q.questionText.toLowerCase().includes(this.searchText.toLowerCase());

      // Filter by question type
      const typeMatch = !this.selectedType || q.type === this.selectedType;

      return textMatch && typeMatch;
    });
  }

  // Helper method to get option letter (A, B, C, etc.)
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Helper method to check if question has at least one correct option
  hasCorrectOption(question: Question): boolean {
    if (question.type === QuestionType.TEXT) {
      return !!question.correctAnswer;
    }
    return question.options?.some((option: any) => this.isOptionCorrect(option));
  }

  // Helper method to get display text for quiz types
  getQuestionTypeDisplay(type: string): string {
    const questionType = this.questionTypes.find(t => t.value === type);
    return questionType ? questionType.display : type;
  }

  // Helper method to get the correct option text for SINGLE questions
  getCorrectOptionText(question: Question): string {  // Specify Question instead of any
    if (question.type !== QuestionType.SINGLE || !question.options) {
      return 'N/A';
    }

    const correctOption = question.options.find((opt: any) => this.isOptionCorrect(opt));
    if (!correctOption) {
      return 'No correct answer specified';
    }

    return correctOption.answerText;
  }

  // Helper method to get all correct options for MCQ questions
  getCorrectOptionsText(question: Question): string {  // Specify Question instead of any
    if (question.type !== QuestionType.MCQ || !question.options) {
      return 'N/A';
    }

    const correctOptions = question.options
      .filter((opt: any) => this.isOptionCorrect(opt))
      .map(opt => opt.answerText);

    if (correctOptions.length === 0) {
      return 'No correct answers specified';
    }

    return correctOptions.join(', ');
  }

  // Get a chip color based on question type
  getChipColor(type: string): string {
    switch (type) {
      case QuestionType.MCQ: return 'primary';
      case QuestionType.SINGLE: return 'accent';
      case QuestionType.TEXT: return 'warn';
      default: return 'primary';
    }
  }

  // Delete a question
  deleteQuestion(questionId: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      // Placeholder for delete implementation
      this.snackBar.open('Question deletion is not implemented yet.', 'Close', {
        duration: 3000
      });
    }
  }

  // Edit a question
  editQuestion(questionId: number): void {
    // Placeholder for edit implementation
    this.snackBar.open('Question editing is not implemented yet.', 'Close', {
      duration: 3000
    });
  }

  // Method to return to dashboard
  goBackToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Helper method to check if an option is correct (handles API response format)
  isOptionCorrect(option: any): boolean {
    // The API returns 'correct', but we've mapped it to 'isCorrect'
    return option.correct === true;
  }
}
