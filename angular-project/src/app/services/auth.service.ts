import { Injectable, signal } from '@angular/core';
import { User, LoginCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);

  isLoggedIn = signal<boolean>(false);

  constructor() {
    this.checkStoredToken();
  }

  private checkStoredToken(): void {
    const token = localStorage.getItem('jwt_token');
    const username = localStorage.getItem('username');

    if (token && username) {
      this.currentUser.set({ username, token });
      this.isLoggedIn.set(true);
    }
  }

  login(credentials: LoginCredentials): boolean {
    // Mock authentication - v realnosti bi bil HTTP klic
    if (credentials.username && credentials.password.length >= 4) {
      const fakeToken = btoa(`${credentials.username}:${Date.now()}`);

      const user: User = {
        username: credentials.username,
        token: fakeToken,
      };

      localStorage.setItem('jwt_token', fakeToken);
      localStorage.setItem('username', credentials.username);

      this.currentUser.set(user);
      this.isLoggedIn.set(true);

      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUser(): User | null {
    return this.currentUser();
  }
}
