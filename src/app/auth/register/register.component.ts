import {Component, inject, signal} from '@angular/core';
import {AuthModule} from '../auth.module';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../auth.service';
import {Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from '../../dialog/dialog.component';


@Component({
  selector: 'app-register',
  imports: [AuthModule, ReactiveFormsModule, MatButton, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  hide = signal(true);
  dialog = inject(MatDialog);


  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.fetchData('register', this.registerForm.value)
        .subscribe( {
          next: (response: any) => {
            console.log(response);

            //firing dialog based on the api calls
            this.dialog.open(DialogComponent, {
              data: {
                title : "Welcome " + response.user.name,
                message: response.message,
                loading : true
              }
            });

            setTimeout(()=>{
              this.router.navigate(['/login']).then( () => {
                this.dialog.closeAll()
                this.registerForm.reset();
              });
            },1000);


          },
          error: ( error: any) =>{
            console.log(error);

            this.dialog.open(DialogComponent, {
              data: {
                title : "Error",
                message : error.error.message
              }
            })

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
