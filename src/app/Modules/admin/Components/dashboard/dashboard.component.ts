import { Component} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {AdminService} from '../../Services/admin.service';
import {Observable, of} from 'rxjs';
import {RouterLink} from '@angular/router';

export interface Quiz {
  id: number;
  title: string;
  description: string;
  time: string;
  cols?: number;
  rows?: number;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
  ]
})
export class DashboardComponent {
  quizzes!: Observable<Quiz[]>;

  /** Based on the screen size, switch from standard to one column per row */
  // cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
  //   map(({ matches }) => {
  //     if (matches) {
  //       return [
  //         { title: HTMLTitleElement, cols: 1, rows: 1 },
  //         { title: HTMLTitleElement, cols: 1, rows: 1 },
  //         { title: HTMLTitleElement, cols: 1, rows: 1 },
  //         { title: HTMLTitleElement, cols: 1, rows: 1 }
  //       ];
  //     }
  //
  //     return [
  //       { title: 'Card 1', cols: 2, rows: 1 },
  //       { title: 'Card 2', cols: 1, rows: 1 },
  //       { title: 'Card 3', cols: 1, rows: 2 },
  //       { title: 'Card 4', cols: 1, rows: 1 }
  //     ];
  //   })
  // );

  constructor(private adminService: AdminService) {
  }

  ngOnInit() {
    this.getAllQuiz();
  }



getAllQuiz() {
  this.adminService.getAllQuizzes().subscribe({
    next: (result: Quiz[]) => {
      console.log(result);  // Log the result to verify the data

      this.quizzes = of(result.map(quiz => ({
        ...quiz,
        time: this.getFormattedTime(quiz.time),
        description: quiz.description,
        cols: 2,
        rows: 1,
         // Default column span
         // Default row span
      }))); // Wrap in `of()` to return an Observable
    },
    error: error => {
      console.error(error);
    }
  });
}



getFormattedTime(time: string) : string{
    console.log(time);
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;

    return `\n ${displayHours} hour(s) and ${displayMinutes} minute(s)`;
  }
}
