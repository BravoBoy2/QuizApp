import { Routes } from '@angular/router';

import {NotFoundComponent} from './not-found/not-found.component';
import {HomeComponent} from './home/home.component';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';

export const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'register', component: RegisterComponent, title:'register'},
  {path: 'login', component: LoginComponent, title: 'login'},
  {path: '**', component: NotFoundComponent }
];
