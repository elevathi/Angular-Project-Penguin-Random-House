/**
 * =============================================================================
 * LOGIN COMPONENT - PRIJAVNA STRAN
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. inject()            - Moderna sintaksa za Dependency Injection
 * 2. Template Driven Forms - Obrazec z ngModel
 * 3. Router.navigate()   - Programatična navigacija
 * 4. ActivatedRoute      - Dostop do route parametrov in query params
 * 5. Standalone Component - Komponenta brez NgModule
 *
 * DEPENDENCY INJECTION - DVE SINTAKSI:
 * ------------------------------------
 *
 * STARA SINTAKSA (konstruktor):
 *   constructor(
 *     private authService: AuthService,
 *     private router: Router
 *   ) {}
 *
 * NOVA SINTAKSA (inject):
 *   private authService = inject(AuthService);
 *   private router = inject(Router);
 *
 * Prednosti inject():
 * - Ni potreben konstruktor
 * - Manj boilerplate kode
 * - Deluje v funkcijah (guards, interceptors)
 * - Lažje testiranje
 *
 * AKTIVATED ROUTE:
 * ----------------
 * ActivatedRoute vsebuje informacije o trenutni poti:
 *
 *   route.snapshot.paramMap.get('id')     ← Route parametri (:id)
 *   route.snapshot.queryParams['key']     ← Query parametri (?key=value)
 *   route.params.subscribe(...)           ← Reaktivno spremljanje
 *
 * =============================================================================
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Za TDF
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,  // Standalone - brez NgModule
  imports: [
    CommonModule,    // Za *ngIf, *ngFor, ngClass
    FormsModule      // Za [(ngModel)] in validacijo
  ],
  templateUrl: 'login.html'
})
export class LoginComponent {

  // ===========================================================================
  // DEPENDENCY INJECTION Z inject()
  // ===========================================================================
  /**
   * inject() FUNKCIJA:
   * ==================
   * Moderna alternativa za DI preko konstruktorja.
   *
   * inject(AuthService) vrne instanco AuthService.
   * Angular jo poišče v dependency injection containeru.
   *
   * private = dostopno samo znotraj komponente
   *
   * Ekvivalentno:
   *   constructor(private authService: AuthService) {}
   */
  private authService = inject(AuthService);

  /**
   * Router za programatično navigacijo
   * Uporaba: this.router.navigate(['/search']);
   */
  private router = inject(Router);

  /**
   * ActivatedRoute za dostop do route informacij
   * Uporaba: this.route.snapshot.queryParams['returnUrl']
   */
  private route = inject(ActivatedRoute);

  // ===========================================================================
  // MODEL OBRAZCA (za ngModel)
  // ===========================================================================
  /**
   * Objekt za two-way binding z obrazcem
   *
   * V predlogi:
   *   <input [(ngModel)]="credentials.username">
   *   <input [(ngModel)]="credentials.password">
   */
  credentials = {
    username: '',
    password: ''
  };

  /**
   * Dodatna polja obrazca
   */
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  // ===========================================================================
  // ODDAJA OBRAZCA
  // ===========================================================================
  /**
   * onSubmit - kliče se ob oddaji obrazca
   *
   * V predlogi:
   *   <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
   *
   * @param form - NgForm referenca iz predloge
   *
   * KORAKI:
   * 1. Preveri veljavnost obrazca
   * 2. Prikaži loading stanje
   * 3. Pokliči AuthService.login()
   * 4. Ob uspehu: navigiraj na returnUrl ali /search
   * 5. Ob napaki: prikaži sporočilo
   */
  onSubmit(form: any): void {
    // Preveri veljavnost obrazca
    if (form.invalid) return;

    // Nastavi loading stanje
    this.isLoading = true;
    this.errorMessage = '';

    /**
     * SIMULACIJA API KLICA:
     * =====================
     * setTimeout simulira asinhroni HTTP klic.
     *
     * V produkciji bi bilo:
     *   this.authService.login(this.credentials).subscribe({
     *     next: () => this.router.navigate(['/search']),
     *     error: (err) => this.errorMessage = err.message
     *   });
     */
    setTimeout(() => {
      // Pokliči AuthService
      const success = this.authService.login(this.credentials);

      if (success) {
        /**
         * RETURN URL:
         * ===========
         * Če je uporabnik prišel iz zaščitene poti, ga vrnemo nazaj.
         *
         * Primer:
         *   1. Uporabnik obišče /author/123
         *   2. AuthGuard preusmeri na /login?returnUrl=/author/123
         *   3. Po prijavi preberemo returnUrl in navigiramo nazaj
         *
         * route.snapshot - trenutno stanje (ne-reaktivno)
         * queryParams['returnUrl'] - vrednost query parametra
         */
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/search';

        /**
         * PROGRAMATIČNA NAVIGACIJA:
         * =========================
         * router.navigate([pot]) - navigiraj na pot
         *
         * Array omogoča sestavljanje poti:
         *   this.router.navigate(['/author', authorId]);
         *   → /author/12345
         */
        this.router.navigate([returnUrl]);
      } else {
        // Prijava ni uspela
        this.errorMessage = 'Napačno uporabniško ime ali geslo.';
      }

      // Ponastavi loading stanje
      this.isLoading = false;
    }, 1000);  // 1 sekunda zakasnitev za demo
  }
}
