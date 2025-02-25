import { Component } from '@angular/core';
import { RouterModule} from '@angular/router';
import {NavigationComponent} from './navigation/navigation.component';


@Component({
  selector: 'app-root',
  imports: [NavigationComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Quiz App';

  // isUserLoggedIn: boolean = UserStorageService.isUser();
  // isAdminLoggedIn: boolean = UserStorageService.isAdmin();
  //
  // constructor(private router: Router) {}
  //
  // ngOnInit() {
  //   this.router.events.subscribe(event => {
  //     this.isUserLoggedIn = UserStorageService.isUser();
  //     this.isAdminLoggedIn = UserStorageService.isAdmin();
  //   })
  // }

  // logout() {
  //   UserStorageService.logOut();
  //   this.router.navigate(['/login']);
  // }
}
