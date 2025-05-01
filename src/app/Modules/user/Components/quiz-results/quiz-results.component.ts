import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserQuizService } from '../../Service/user-quiz.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-quiz-results',
  standalone: true, // Add standalone: true here
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="results-container">
      <mat-card class="results-card">
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>assessment</mat-icon>
          </div>
          <mat-card-title>Quiz Results</mat-card-title>
          <mat-card-subtitle>{{ quizResult?.quizTitle || 'Quiz' }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (quizResult) {
            <div class="score-display">
              <h2>Your Score: {{ quizResult.percentageCorrAnswer.toFixed(1) }}%</h2>
              <mat-progress-bar
                [color]="getScoreColor(quizResult.percentageCorrAnswer)"
                [value]="quizResult.percentageCorrAnswer"
                mode="determinate">
              </mat-progress-bar>

              <div class="score-details">
                <p>Correct Answers: {{ quizResult.totalCorrectAnswers }} out of {{ quizResult.totalQuestions }}</p>
              </div>
            </div>
          } @else if (loading) {
            <p>Loading results...</p>
          } @else {
            <p>No results available.</p>
          }
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> Back to Dashboard
          </button>
          <button mat-raised-button color="primary" (click)="viewAllResults()">
            View All Results
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .results-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .results-card {
      margin-bottom: 20px;
    }

    .score-display {
      text-align: center;
      padding: 20px 0;
    }

    .score-details {
      margin-top: 20px;
      font-size: 1.2em;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
    }
  `]
})
export class QuizResultsComponent implements OnInit {
  quizId!: number;
  userId = 1; // Default user ID, should be retrieved from auth service
  quizResult: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: UserQuizService
  ) {
    // Get the current user ID from localStorage
    this.getCurrentUser();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizId = +params['id'];
      this.loadQuizResult();
    });
  }

  getCurrentUser(): void {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          this.userId = user.id;
          console.log('Using authenticated user ID from localStorage:', this.userId);
          return;
        }
      }
      console.log('No user found in localStorage, using default userId: 1');
    } catch (error) {
      console.error('Error retrieving user from localStorage:', error);
    }
  }

  loadQuizResult(): void {
    this.loading = true;
    this.quizService.getQuizResultsByQuiz(this.quizId).subscribe({
      next: (data) => {
        console.log('Quiz result data received:', data);
        this.quizResult = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading quiz result', err);
        this.loading = false;
      }
    });
  }

  getScoreColor(score: number): string {
    // Use standard Material theme colors for consistency
    if (score < 60) return 'warn';     // Red for failing
    if (score < 80) return 'primary';  // Primary for passing
    return 'accent';                   // Accent for excellent scores
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  viewAllResults(): void {
    this.router.navigate(['/user/view-results']);
  }
}


