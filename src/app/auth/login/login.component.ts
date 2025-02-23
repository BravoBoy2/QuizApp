import {Component, signal} from '@angular/core';
import {AuthModule} from '../auth.module';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [AuthModule, ReactiveFormsModule, MatButton, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
hide = signal(true);


loginForm = new FormGroup({
  email : new FormControl('',[Validators.required, Validators.email]),
  password: new FormControl('',[Validators.required, Validators.minLength(6)]),

});

constructor(private authService : AuthService) {}


  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.fetchData('login', this.loginForm.value).subscribe({
      next: (response: HttpResponse<any>) =>
    {
      console.log(response);
    },
    error: (error: HttpResponse<any>) => {
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
