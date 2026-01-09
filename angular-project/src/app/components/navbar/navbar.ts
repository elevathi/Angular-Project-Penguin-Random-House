import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-book me-2"></i>PRH Books
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                Domov
              </a>
            </li>
            @if (authService.isLoggedIn()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/search" routerLinkActive="active">
                  Iskanje
                </a>
              </li>
            }
          </ul>
          
          <ul class="navbar-nav">
            @if (authService.isLoggedIn()) {
              <li class="nav-item">
                <span class="nav-link text-light">
                  <i class="bi bi-person-circle me-1"></i>
                  {{ authService.getUser()?.username }}
                </span>
              </li>
              <li class="nav-item">
                <button class="btn btn-outline-light btn-sm" (click)="logout()">
                  Odjava
                </button>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">
                  Prijava
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}