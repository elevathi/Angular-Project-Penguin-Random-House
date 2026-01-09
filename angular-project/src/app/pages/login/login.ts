import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-header bg-primary text-white text-center">
              <h4 class="mb-0">
                <i class="bi bi-box-arrow-in-right me-2"></i>Prijava
              </h4>
            </div>
            <div class="card-body">
              
              <!-- TDF Form -->
              <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
                
                <!-- Username -->
                <div class="mb-3">
                  <label for="username" class="form-label">Uporabniško ime</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username"
                    name="username"
                    [(ngModel)]="credentials.username"
                    #username="ngModel"
                    required
                    minlength="3"
                    [ngClass]="{'is-invalid': username.invalid && username.touched}">
                  
                  @if (username.invalid && username.touched) {
                    <div class="invalid-feedback">
                      @if (username.errors?.['required']) {
                        Uporabniško ime je obvezno.
                      }
                      @if (username.errors?.['minlength']) {
                        Minimalno 3 znaki.
                      }
                    </div>
                  }
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label for="password" class="form-label">Geslo</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password"
                    name="password"
                    [(ngModel)]="credentials.password"
                    #password="ngModel"
                    required
                    minlength="4"
                    [ngClass]="{'is-invalid': password.invalid && password.touched}">
                  
                  @if (password.invalid && password.touched) {
                    <div class="invalid-feedback">
                      @if (password.errors?.['required']) {
                        Geslo je obvezno.
                      }
                      @if (password.errors?.['minlength']) {
                        Minimalno 4 znaki.
                      }
                    </div>
                  }
                </div>

                <!-- Remember me -->
                <div class="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="rememberMe"
                    name="rememberMe"
                    [(ngModel)]="rememberMe">
                  <label class="form-check-label" for="rememberMe">
                    Zapomni si me
                  </label>
                </div>

                <!-- Error message -->
                @if (errorMessage) {
                  <div class="alert alert-danger" role="alert">
                    {{ errorMessage }}
                  </div>
                }

                <!-- Submit -->
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="loginForm.invalid || isLoading">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Prijavljam...
                  } @else {
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Prijava
                  }
                </button>

              </form>

              <!-- Demo info -->
              <div class="mt-3 p-2 bg-light rounded small">
                <strong>Demo:</strong> Vnesi katerokoli uporabniško ime (min. 3 znaki) in geslo (min. 4 znaki).
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  credentials = {
    username: '',
    password: ''
  };
  
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  onSubmit(form: any): void {
    if (form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Simulacija API klica
    setTimeout(() => {
      const success = this.authService.login(this.credentials);
      
      if (success) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/search';
        this.router.navigate([returnUrl]);
      } else {
        this.errorMessage = 'Napačno uporabniško ime ali geslo.';
      }
      
      this.isLoading = false;
    }, 1000);
  }
}