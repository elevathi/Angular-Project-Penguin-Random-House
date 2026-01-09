import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  navigateToSearch(type: 'authors' | 'titles'): void {
    if (this.authService.isLoggedIn()) {
      // Navigate to "All Authors" or "All Titles" tabs instead of search tabs
      const browseType = type === 'authors' ? 'all-authors' : 'all-titles';
      this.router.navigate(['/search'], { queryParams: { type: browseType } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}