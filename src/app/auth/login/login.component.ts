import {Component, inject, signal, HostListener} from '@angular/core';
import {AuthModule} from '../auth.module';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from '../../dialog/dialog.component';
import {UserStorageService} from '../../Services/user-storage.service';

@Component({
  selector: 'app-login',
  imports: [AuthModule, ReactiveFormsModule, MatButton, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
hide = signal(true);
dialog = inject(MatDialog);
userStorage = inject(UserStorageService);


loginForm = new FormGroup({
  email : new FormControl('',[Validators.required, Validators.email]),
  password: new FormControl('',[Validators.required, Validators.minLength(6)]),

});

constructor(private authService : AuthService, private router : Router) { }

@HostListener('document:keydown.enter', ['$event'])
onEnterKey(event: KeyboardEvent) {
  event.preventDefault();
  if (!this.dialog.openDialogs.length) {
    this.onSubmit();
  }
}

  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login('login', this.loginForm.value).subscribe({
      next: (response: any) =>
    {

      this.dialog.open(DialogComponent, {
        data: {
          title: "Logged in successfully!",
          message: `Welcome ${response.name}`,
          loading: true
        }
      });

      const user = {
        id: response.id,
        name: response.name,
        email: response.email,
        role : response.role,
      };
      this.userStorage.saveUser(user);

      setTimeout(()=>{
        this.loginForm.reset();
        this.dialog.closeAll();
        if (this.userStorage.isUser()){
          this.router.navigate(['user/dashboard']);
        } else if (this.userStorage.isAdmin()){
          this.router.navigate(['admin/dashboard']);
        }
        },2000);
      console.log(response);
    },
    error: (error: any) => {
        console.error('Login error:', error); // Log the error

        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Use the server message if available
        }

          this.dialog.open(DialogComponent,
             { data : {
            title: 'Error',
              message : "email or password is incorrect",
               errorDetails: error // Pass the entire error object
             },
             });
    }
  })
  }
  }

  //password hide or show icon for password field
  clickEvent(event : MouseEvent){
    this.hide.set(!this.hide());
    event.stopPropagation();

  }

}
