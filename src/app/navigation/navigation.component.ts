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
  private breakpointObserver = inject(BreakpointObserver);

  isUserLoggedIn: boolean = false;
  isAdminLoggedIn: boolean = false;
  userStorage = inject(UserStorageService);
  dialog = inject(MatDialog);

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      this.isUserLoggedIn = this.userStorage.isUser();
      this.isAdminLoggedIn = this.userStorage.isAdmin();
    })
  }

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

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
