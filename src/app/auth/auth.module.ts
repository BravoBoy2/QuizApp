import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIcon,
    MatInputModule,
    MatIconButton,

  ],
  exports: [MatIcon,
  MatInputModule,
  MatIconButton]
})
export class AuthModule { }
