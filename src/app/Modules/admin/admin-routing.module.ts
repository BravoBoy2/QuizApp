import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { CreateQuizComponent } from './Components/create-quiz/create-quiz.component';
import { AddQuestionsComponent } from './Components/add-questions/add-questions.component';
import { ViewQuizComponent } from './Components/view-quiz/view-quiz.component';
import { AllUsersResultsComponent } from './Components/all-users-results/all-users-results.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'createQuiz', component: CreateQuizComponent },
  { path: 'add-questions/:id', component: AddQuestionsComponent },
  { path: 'view-quiz/:id', component: ViewQuizComponent },
  { path: 'results', component: AllUsersResultsComponent, title: 'All Quiz Results' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
