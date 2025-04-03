import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserStorageService } from '../Services/user-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [MatButtonModule, MatCardModule, MatSnackBarModule]
})
export class HomeComponent {
  constructor(
    private router: Router,
    private userStorage: UserStorageService,
    private snackBar: MatSnackBar
  ) {}

  // Navigate to the quiz page or login page based on user authentication
  goToQuizzes() {
    if (this.userStorage.getUser()) {
      this.router.navigate(['/user/dashboard']); // Navigate to dashboard if logged in
    } else {
      setTimeout(() => {
        this.snackBar.open('Please log in to access the dashboard.', 'Close', {
          duration: 2000, // Message duration in milliseconds
        });
        this.router.navigate(['/login']); // Navigate to login page after delay
      },500); // Delay before showing the snackbar and redirecting
    }
  }
}
