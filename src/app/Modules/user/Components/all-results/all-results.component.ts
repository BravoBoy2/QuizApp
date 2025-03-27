import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserQuizService } from '../../Service/user-quiz.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-all-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="all-results-container">
      <h1>Quiz Results History</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Your Performance</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-indicator">
              <p>Loading results...</p>
            </div>
          } @else if (results().length === 0) {
            <div class="no-data">
              <p>No quiz results available. Try taking a quiz!</p>
              <button mat-raised-button color="primary" (click)="goToDashboard()">
                Browse Available Quizzes
              </button>
            </div>
          } @else {
            <table mat-table [dataSource]="results()" class="results-table">
              <ng-container matColumnDef="quizTitle">
                <th mat-header-cell *matHeaderCellDef>Quiz</th>
                <td mat-cell *matCellDef="let result">{{ result.quizTitle }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date Taken</th>
                <td mat-cell *matCellDef="let result">{{ result.createdAt | date:'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="score">
                <th mat-header-cell *matHeaderCellDef>Score</th>
                <td mat-cell *matCellDef="let result">
                  <div class="score-cell">
                    {{ result.percentageCorrAnswer.toFixed(1) }}%
                    <mat-progress-bar
                      [value]="result.percentageCorrAnswer"
                      [color]="getScoreColor(result.percentageCorrAnswer)">
                    </mat-progress-bar>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>Details</th>
                <td mat-cell *matCellDef="let result">
                  <button mat-button color="primary" (click)="viewDetails(result.id)">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="goToDashboard()">
            <mat-icon>arrow_back</mat-icon> Back to Dashboard
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .all-results-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .results-table {
      width: 100%;
    }

    .score-cell {
      display: flex;
      flex-direction: column;
      width: 150px;
    }

    mat-progress-bar {
      margin-top: 5px;
    }

    .no-data {
      text-align: center;
      padding: 30px;
    }

    .loading-indicator {
      text-align: center;
      padding: 20px;
    }
  `]
})
export class AllResultsComponent {
  loading = signal(true);
  results = signal<any[]>([]);
  displayedColumns: string[] = ['quizTitle', 'date', 'score', 'details'];

  constructor(
    private router: Router,
    private quizService: UserQuizService
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    // Using user ID 1 for now - in a real app, get this from your auth service
    this.quizService.getQuizResults(1).subscribe({
      next: (data) => {
        this.results.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading quiz results', err);
        this.loading.set(false);
        // Set empty results on error
        this.results.set([]);
      }
    });
  }

  getScoreColor(score: number): string {
    // Use standard Material theme colors for consistency
    if (score < 60) return 'warn';     // Red for failing
    if (score < 80) return 'primary';  // Primary for passing
    return 'accent';                   // Accent for excellent scores
  }

  viewDetails(resultId: number): void {
    this.router.navigate(['/user/quiz-results', resultId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
