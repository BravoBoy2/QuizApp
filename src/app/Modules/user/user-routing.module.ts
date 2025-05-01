import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { InQuizComponent } from './Components/in-quiz/in-quiz.component';
import { ViewResultComponent } from './Components/view-result/view-result.component';
import { QuizResultsComponent } from './Components/quiz-results/quiz-results.component';


const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
  { path: 'start-quiz/:id', component: InQuizComponent, title: 'Start Quiz' },
  { path: 'view-results', component: ViewResultComponent, title: 'View Results' },
  { path: 'quiz-results/:id', component: QuizResultsComponent, title: 'Quiz Results' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
