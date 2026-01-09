import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'login.html'
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