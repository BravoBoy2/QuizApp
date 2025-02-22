import {Component, signal} from '@angular/core';
import {AuthModule} from '../auth.module';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../auth.service';
import {HttpResponse} from '@angular/common/http';


@Component({
  selector: 'app-register',
  imports: [AuthModule, ReactiveFormsModule, MatButton],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  hide = signal(true);


  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private authService: AuthService) {
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.fetchData('register', this.registerForm.value)
        .subscribe( {
          next: (response: HttpResponse<any>) => {
            console.log(response);
          },
          error: ( error: HttpResponse<any>) =>{

            console.log(error);
          }
        });
    }
  }

  //reactive field error on the template
  hasDisplableError(ControlName:string) : boolean {
    const control = this.registerForm.get(ControlName);
    return Boolean(control?.invalid) && Boolean(control?.touched);
  }

  //password hide or show icon for password field
  clickEvent(event : MouseEvent){
    this.hide.set(!this.hide());
    event.stopPropagation();

  }


}
