import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  imports: [MatButtonModule, MatCardModule]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  // Navigate back to the home page
  goToHome() {
    this.router.navigate(['/']);
  }
}
