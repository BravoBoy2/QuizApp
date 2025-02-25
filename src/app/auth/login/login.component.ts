import {Component, inject, signal} from '@angular/core';
import {AuthModule} from '../auth.module';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from '../../dialog/dialog.component';

@Component({
  selector: 'app-login',
  imports: [AuthModule, ReactiveFormsModule, MatButton, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
hide = signal(true);
dialog = inject(MatDialog);


loginForm = new FormGroup({
  email : new FormControl('',[Validators.required, Validators.email]),
  password: new FormControl('',[Validators.required, Validators.minLength(6)]),

});

constructor(private authService : AuthService, private router : Router) { }


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

      setTimeout(()=>{
        this.router.navigate(['/'])
          .then(() =>{
        this.loginForm.reset();
        this.dialog.closeAll();
        }
      )},2000);
      console.log(response);
    },
    error: (error: any) => {
        this.dialog.open(DialogComponent,
           { data : {
          title: 'Error',
            message : error.error.message
           },
           });
        console.log(error);
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
