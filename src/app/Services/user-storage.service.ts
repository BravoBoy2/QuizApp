import { Injectable } from '@angular/core';
import {User} from '../Shared/User';
import {UserRole} from '../Shared/UserRole';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  private readonly user = "user";

  constructor() { }

  saveUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));

  }

  getUser() : User | null{
      const userString = localStorage.getItem(this.user);
      if (userString) {
        try {
          return JSON.parse(userString);
        } catch (error) {
          console.error("Error parsing user data", error);
          this.logOut();
          return null;
        }
    }
    return null;
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user ? user.id : null;
  }

  getUserRole(): UserRole | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  logOut() : void {
    localStorage.removeItem("user");
  }

  isAdmin(): boolean {
    return this.getUserRole() === "ADMIN";
  }

  isUser(): boolean {
    return this.getUserRole() === "USER";
  }






//   static saveUser (user: any) {
//     localStorage.removeItem(USER);
//     localStorage.setItem(USER, JSON.stringify(user));
//   }
//
//   static getUser(){
//     return JSON.parse(localStorage.getItem(USER));
//   }
//
//   static getUserId() : number {
//     const user = this.getUser();
//     if(user == null){
//       return 0;
//     }
//     return user.id;
//   }
//
//   static getUserRole(): string {
//     const user = this.getUser();
//     if(user == null){
//       return '';
//     }
//     return user.role;
// }
//
// static isAdmin() : boolean {
//   return this.getUserRole() === "ADMIN";
// }
//
//
//   static isUser() : boolean {
//     return this.getUserRole() === "USER";
//   }
//
//   static logOut() : void {
//     localStorage.removeItem(USER);
//   }
}
