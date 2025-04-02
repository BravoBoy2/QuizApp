import { Quiz } from '../../../../Shared/quiz';
import { UserQuizService } from './../../Service/user-quiz.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class DashboardComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private snackBar = inject(MatSnackBar);

  Quizzes: any[] = [];
  loading = signal(false); // Use signal for loading state
  error: string | null = null;

  cols = 1; // Default column count
  rows = 1;

  constructor(
    private userQuizService: UserQuizService,
    private router: Router
  ) {}

  ngOnInit() {
    // Set up responsive columns
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web
    ]).pipe(
      map(result => {
        // Adjust columns based on screen size
        if (result.matches) {
          if (result.breakpoints[Breakpoints.Handset]) {
            return 1; // One column for mobile
          } else if (result.breakpoints[Breakpoints.Tablet]) {
            return 2; // Two columns for tablet
          }
        }
        return 2; // Three columns for larger screens
      })
    ).subscribe(cols => {
      this.cols = cols;
    });

    this.getAllQuizzes();
  }

  getAllQuizzes() {
    this.loading.set(true); // Use signal setter method
    this.error = null;

    this.userQuizService.getAllQuizzes().subscribe({
      next: (response: any) => {
        console.log('Quizzes response:', response);

        // Handle different response formats
        let quizzes: Quiz[];
        if (Array.isArray(response)) {
          quizzes = response;
        } else if (response && Array.isArray(response.quizTestDTOs)) {
          quizzes = response.quizTestDTOs;
        } else {
          quizzes = [];
          this.error = 'Unexpected response format';
        }

        // Transform quizzes for display
        this.Quizzes = quizzes.map(quiz => ({
          ...quiz,
          cols: 1,
          rows: 1,
          formattedTime: this.getFormattedTime(quiz.time)
        }));

        this.loading.set(false); // Use signal setter method
      },
      error: (err) => {
        console.error('Error fetching quizzes:', err);
        this.error = 'Failed to load quizzes. Please try again later.';
        this.loading.set(false); // Use signal setter method
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
      }
    });
  }

  getFormattedTime(time: string): string {
    if (!time) return 'No time limit';

    try {
      const [hours, minutes] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const displayHours = Math.floor(totalMinutes / 60);
      const displayMinutes = totalMinutes % 60;

      return `${displayHours} hour(s) and ${displayMinutes} minute(s)`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return time;
    }
  }

  startQuiz(quizId: number): void {
    this.router.navigate(['/user/start-quiz/', quizId]);
  }

  viewQuizDetails(quizId: number): void {
    this.router.navigate(['/user/quiz-results', quizId]);
  }
}

