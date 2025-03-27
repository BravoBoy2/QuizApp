import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { InQuizComponent } from './Components/in-quiz/in-quiz.component';
import { QuizResultsComponent } from './Components/quiz-results/quiz-results.component';
import { AllResultsComponent } from './Components/all-results/all-results.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
  { path: 'in-quiz/:id', component: InQuizComponent, title: 'Taking Quiz' },
  { path: 'quiz-results/:id', component: QuizResultsComponent, title: 'Quiz Results' },
  { path: 'results', component: AllResultsComponent, title: 'All Quiz Results' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
