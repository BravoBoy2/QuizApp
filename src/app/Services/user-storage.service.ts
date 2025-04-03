import { Injectable } from '@angular/core';
import {User} from '../Shared/User';
import {UserRole} from '../Shared/UserRole';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  private readonly user = "user"; // Key used to store user data in localStorage

  constructor() { }

  // Save user data to localStorage
  saveUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Retrieve user data from localStorage
  getUser(): User | null {
    const userString = localStorage.getItem(this.user);
    if (userString) {
      try {
        return JSON.parse(userString); // Parse and return user data
      } catch (error) {
        console.error("Error parsing user data", error);
        this.logOut(); // Log out if parsing fails
        return null;
      }
    }
    return null; // Return null if no user data is found
  }

  // Get the ID of the logged-in user
  getUserId(): number | null {
    const user = this.getUser();
    return user ? user.id : null;
  }

  // Get the role of the logged-in user
  getUserRole(): UserRole | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // Log out the user by removing user data from localStorage
  logOut(): void {
    localStorage.removeItem("user");
  }

  // Check if the logged-in user is an admin
  isAdmin(): boolean {
    return this.getUserRole() === "ADMIN";
  }

  // Check if the logged-in user is a regular user
  isUser(): boolean {
    return this.getUserRole() === "USER";
  }

  // ...existing commented-out code...
}
