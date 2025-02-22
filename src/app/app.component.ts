import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import {NavigationComponent} from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  imports: [NavigationComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Quiz App';

  constructor() {}
}
