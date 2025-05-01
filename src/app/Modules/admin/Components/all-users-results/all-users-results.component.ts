import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AdminService } from '../../Services/admin.service';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-all-users-results',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './all-users-results.component.html',
  styleUrls: ['./all-users-results.component.scss']
})
export class AllUsersResultsComponent  {
  loading = signal(true);
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['userId', 'userName', 'quizId', 'quizTitle', 'date', 'score', 'correctAnswers', 'actions'];
  filterValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllResults();
  }

  ngAfterViewInit() {
    if (this.dataSource.data.length > 0) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadAllResults(): void {
    this.loading.set(true);

    this.adminService.getAllQuizResults().subscribe({
      next: (data: any) => {
        console.log('Results data received:', data);

        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log('No results found');
          this.dataSource.data = [];
          this.loading.set(false);
          return;
        }

        this.dataSource.data = Array.isArray(data) ? data : [data];
        console.log(`Loaded ${this.dataSource.data.length} results`);

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
    this.loadAllResults();
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
    this.router.navigate(['/admin/view-quiz', quizId]);
  }

  viewUserDetails(userId: number): void {
    this.router.navigate(['/admin/view-user', userId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  exportResults(): void {
    // Create CSV data
    const headers = ['User ID', 'User Name', 'Quiz ID', 'Quiz Title', 'Date', 'Score', 'Correct Answers', 'Total Questions'];

    const csvData = this.dataSource.filteredData.map(item => [
      item.userId || '',
      item.userName || '',
      item.quizId || item.id || '',
      item.quizTitle || '',
      item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
      (item.percentageCorrAnswer || 0).toFixed(1) + '%',
      item.totalCorrectAnswers || 0,
      item.totalQuestions || 0
    ]);

    // Create CSV string
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'quiz_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
