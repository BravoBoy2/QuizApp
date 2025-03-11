import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from './Components/dashboard/dashboard.component';
import {CreateQuizComponent} from './Components/create-quiz/create-quiz.component';
import {AddQuestionsComponent} from './Components/add-questions/add-questions.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: "createQuiz", component: CreateQuizComponent},
  {path: "add-questions/:id", component: AddQuestionsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
