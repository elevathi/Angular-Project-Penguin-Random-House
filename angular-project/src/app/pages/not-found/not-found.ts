import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mt-5 text-center">
      <h1 class="display-1 text-muted">404</h1>
      <h2 class="mb-4">Stran ne obstaja</h2>
      <p class="text-muted mb-4">
        Stran, ki jo iščeš, ne obstaja ali je bila premaknjena.
      </p>
      <a routerLink="/" class="btn btn-primary">
        <i class="bi bi-house me-2"></i>Nazaj na domov
      </a>
    </div>
  `
})
export class NotFoundComponent {}