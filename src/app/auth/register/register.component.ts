import {Component, inject, signal, AfterViewInit, ElementRef, ViewChild, HostListener} from '@angular/core';
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
export class RegisterComponent implements AfterViewInit {
  hide = signal(true);
  dialog = inject(MatDialog);

  @ViewChild('registerButton') registerButton: ElementRef | undefined;

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  ngAfterViewInit(): void {
    if (this.registerButton) {
      this.registerButton.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    if (!this.dialog.openDialogs.length) { // Check if a dialog is open
      this.onSubmit();
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.fetchData('register', this.registerForm.value)
        .subscribe( {
          next: (response: any) => {
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
            },2000);


          },
          error: ( error: any) =>{
            console.error('Registration error:', error); // Log the error

            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Use the server message if available
            }

            this.dialog.open(DialogComponent, {
              data: {
                title : "Error",
                message : "unexpected error occurred",
                errorDetails: error // Pass the entire error object
              }
            });
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
