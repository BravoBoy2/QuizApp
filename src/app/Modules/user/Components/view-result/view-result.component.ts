import { AuthService } from './../../../../auth/auth.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserQuizService } from '../../Service/user-quiz.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-view-result',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.scss']
})
export class ViewResultComponent implements OnInit {
  loading = signal(true);
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['quizId', 'quizTitle', 'date', 'score', 'correctAnswers', 'actions'];
  filterValue: string = '';
  userId: number = 1; // Default to 1 as fallback
  userName: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private quizService: UserQuizService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get user from localStorage in a more robust way
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          this.userId = user.id;
          this.userName = user.name || '';
          console.log('Retrieved user ID from localStorage:', this.userId);
          console.log('Retrieved user data:', user);
          this.loadResults();
          return;
        }
      }
      console.log('No user found in localStorage, using default userId: 1');
      this.userId = 1; // Default to 1 if no user found
      this.loadResults();
    } catch (error) {
      console.error('Error retrieving user from localStorage:', error);
      this.userId = 1; // Default to 1 if there's an error
      this.loadResults();
    }
  }

  ngAfterViewInit() {
    // Make sure views are loaded before connecting them
    if (this.dataSource.data.length > 0) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadResults(): void {
    this.loading.set(true);

    console.log(`Loading results for user ID: ${this.userId}`);

    // Always use userId, which is now correctly loaded from localStorage
    this.quizService.getQuizResults(this.userId).subscribe({
      next: (data: any) => {
        console.log('Results data received:', data);

        // Make sure we handle empty results
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log('No results found for this user');
          this.dataSource.data = [];
          this.loading.set(false);
          return;
        }

        this.dataSource.data = Array.isArray(data) ? data : [data];

        console.log(`Loaded ${this.dataSource.data.length} results`);

        // Connect sort and paginator after data is loaded
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });

        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading quiz results:', err);
        this.snackBar.open('Error loading quiz results. Please try again later.', 'Close', {
          duration: 5000
        });
        this.dataSource.data = [];
        this.loading.set(false);
      }
    });
  }

  refreshData(): void {
    this.loadResults();
  }

  calculateAverageScore(): number {
    if (this.dataSource.data.length === 0) return 0;

    const total = this.dataSource.data.reduce((sum, result) =>
      sum + result.percentageCorrAnswer, 0);
    return total / this.dataSource.data.length;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getScoreColor(score: number): string {
    if (score < 60) return 'warn';     // Red for failing
    if (score < 80) return 'primary';  // Primary for passing
    return 'accent';                  // Accent for excellent scores
  }

  viewQuizDetails(quizId: number): void {
    this.router.navigate(['/user/quiz-results', quizId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
