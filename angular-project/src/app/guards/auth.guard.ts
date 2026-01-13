/**
 * =============================================================================
 * AUTH GUARD - ZAŠČITA POTI (ROUTE GUARD)
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. CanActivateFn       - Funkcijski route guard
 * 2. inject()            - Dependency Injection v funkcijah
 * 3. Router.navigate()   - Programatična navigacija
 * 4. Query Parameters    - Prenos podatkov preko URL-ja
 *
 * KAJ JE ROUTE GUARD?
 * -------------------
 * Route Guard je funkcija, ki preveri, ali uporabnik SME dostopati do poti.
 *
 * Vrne:
 *   - true  → Uporabnik lahko dostopa, komponenta se naloži
 *   - false → Uporabnik NE more dostopati, navigacija se prekine
 *
 * KAKO DELUJE:
 * ------------
 *
 *   Uporabnik klikne link na /search
 *          │
 *          ▼
 *   ┌─────────────────────────────────────────────┐
 *   │  Router najde route za /search             │
 *   │                                             │
 *   │  {                                          │
 *   │    path: 'search',                          │
 *   │    canActivate: [authGuard] ← IZVEDE SE   │
 *   │  }                                          │
 *   └─────────────────────────────────────────────┘
 *          │
 *          ▼
 *   ┌─────────────────────────────────────────────┐
 *   │           authGuard funkcija                │
 *   │                                             │
 *   │  if (authService.isLoggedIn()) {           │
 *   │    return true;  ← Dovoli dostop           │
 *   │  } else {                                   │
 *   │    router.navigate(['/login']);            │
 *   │    return false; ← Zavrni dostop           │
 *   │  }                                          │
 *   └─────────────────────────────────────────────┘
 *          │
 *          ├── true  → /search se naloži
 *          │
 *          └── false → Preusmeritev na /login
 *                      z returnUrl query parametrom
 *
 * =============================================================================
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * FUNKCIJSKI ROUTE GUARD:
 * =======================
 *
 * CanActivateFn je tip za funkcijske route guarde (Angular 14+).
 * Nadomešča starejši pristop z razredi (class-based guards).
 *
 * Parametri:
 * - route: ActivatedRouteSnapshot - informacije o poti
 * - state: RouterStateSnapshot - stanje routerja (vključno z URL-jem)
 *
 * inject() FUNKCIJA:
 * ==================
 * V funkcijskih guardih ne moremo uporabiti konstruktorja za DI.
 * Namesto tega uporabimo inject() funkcijo:
 *
 *   const authService = inject(AuthService);
 *
 * To je ekvivalentno:
 *   constructor(private authService: AuthService) {}
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Dependency Injection v funkciji
  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * PREVERJANJE AVTENTIKACIJE:
   * ==========================
   * authService.isLoggedIn() vrne signal (boolean)
   * Če pokličemo signal kot funkcijo, dobimo vrednost
   */
  if (authService.isLoggedIn()) {
    // Uporabnik je prijavljen - dovoli dostop
    return true;
  }

  /**
   * PREUSMERITEV NA LOGIN:
   * ======================
   * Če uporabnik NI prijavljen:
   *
   * 1. router.navigate(['/login']) - preusmeri na login stran
   *
   * 2. queryParams: { returnUrl: state.url }
   *    - Shrani originalni URL, ki ga je uporabnik želel obiskati
   *    - Po uspešni prijavi ga lahko preusmerimo nazaj
   *
   * Primer:
   *   Uporabnik želi obiskati: /author/12345
   *   Ni prijavljen, preusmeri na: /login?returnUrl=/author/12345
   *   Po prijavi: preusmeritev nazaj na /author/12345
   */
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  // Zavrni dostop - navigacija na zaščiteno pot se prekine
  return false;
};
