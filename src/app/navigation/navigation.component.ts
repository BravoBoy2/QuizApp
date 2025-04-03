import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {UserStorageService} from '../Services/user-storage.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from '../dialog/dialog.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ]
})
export class NavigationComponent {
  // Breakpoint observer to check screen size
  private breakpointObserver = inject(BreakpointObserver);

  // Boolean to check if user is logged in
  isUserLoggedIn: boolean = false;
  // Boolean to check if admin is logged in
  isAdminLoggedIn: boolean = false;
  // Inject user storage service
  userStorage = inject(UserStorageService);
  // Inject dialog service
  dialog = inject(MatDialog);

  // Constructor for the navigation component
  constructor(private router: Router) {}

  // Lifecycle hook called after component initialization
  ngOnInit() {
    this.router.events.subscribe(event => {
      this.isUserLoggedIn = this.userStorage.isUser();
      this.isAdminLoggedIn = this.userStorage.isAdmin();
    })
  }

  // Method to log out the user
  logout() {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Goodbye',
        message: 'You have been logged out',
      }
    });
    setTimeout(()=>{
      this.dialog.closeAll();
      this.userStorage.logOut();
      this.router.navigate(['/login']);
    },2000);

  }

  // Observable to check if the screen is a handset
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
