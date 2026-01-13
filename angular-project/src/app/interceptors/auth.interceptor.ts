/**
 * =============================================================================
 * AUTH INTERCEPTOR - PRESTREZNIK HTTP ZAHTEV
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. HttpInterceptorFn   - Funkcijski HTTP interceptor
 * 2. Prestrezanje zahtev - Middleware za HTTP klice
 * 3. JWT Token injection - Dodajanje tokena v header
 *
 * KAJ JE INTERCEPTOR?
 * -------------------
 * Interceptor je "middleware" za HTTP zahteve.
 * Prestreže VSAKO HTTP zahtevo/odgovor in jo lahko:
 * - Modificira (doda headerje, transformira body)
 * - Logira
 * - Preusmeri
 * - Prekine
 *
 * KAKO DELUJE:
 * ------------
 *
 *   Komponenta pokliče HTTP zahtevo
 *          │
 *          ▼
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │                    INTERCEPTOR CHAIN                         │
 *   │                                                              │
 *   │  ┌──────────────────┐    ┌──────────────────┐               │
 *   │  │  authInterceptor │ → │  errorInterceptor │ → HTTP       │
 *   │  │                  │    │                  │    Request    │
 *   │  │  Doda JWT token  │    │  Lovi napake    │               │
 *   │  └──────────────────┘    └──────────────────┘               │
 *   │                                                              │
 *   │  Response potuje NAZAJ skozi chain                          │
 *   │                                                              │
 *   │  HTTP      ┌──────────────────┐    ┌──────────────────┐    │
 *   │  Response → │  errorInterceptor │ → │  authInterceptor │ → │
 *   │             │                  │    │                  │    │
 *   │             │  Obdela napake   │    │  (passthrough)   │    │
 *   │             └──────────────────┘    └──────────────────┘    │
 *   └─────────────────────────────────────────────────────────────┘
 *          │
 *          ▼
 *   Komponenta prejme odgovor
 *
 * JWT TOKEN V HEADERJU:
 * ---------------------
 * V produkciji bi ta interceptor dodal JWT token:
 *
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * =============================================================================
 */

import { HttpInterceptorFn } from '@angular/common/http';

/**
 * AUTH INTERCEPTOR:
 * =================
 *
 * HttpInterceptorFn je tip za funkcijske interceptorje (Angular 15+).
 *
 * Parametri:
 * - req: HttpRequest<unknown> - originalna zahteva
 * - next: HttpHandlerFn - funkcija za nadaljevanje verige
 *
 * Vrne Observable<HttpEvent<unknown>> - tok HTTP dogodkov
 *
 * PRIMER DODAJANJA JWT TOKENA:
 * ----------------------------
 *
 *   export const authInterceptor: HttpInterceptorFn = (req, next) => {
 *     const authService = inject(AuthService);
 *     const token = authService.getToken();
 *
 *     if (token) {
 *       // Clone zahtevo in dodaj Authorization header
 *       const clonedReq = req.clone({
 *         setHeaders: {
 *           Authorization: `Bearer ${token}`
 *         }
 *       });
 *       return next(clonedReq);
 *     }
 *
 *     return next(req);
 *   };
 *
 * ZAKAJ CLONE?
 * ------------
 * HttpRequest je IMMUTABLE (nespremenljiv).
 * Ne moremo direktno spremeniti req.headers.
 * Moramo ustvariti KOPIJO z req.clone().
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * V tej aplikaciji PRH API uporablja api_key v query parametrih,
   * ne JWT token v headerju. Zato samo logiramo zahtevo.
   *
   * V produkcijski aplikaciji bi tukaj dodali:
   *
   *   const token = inject(AuthService).getToken();
   *   if (token) {
   *     req = req.clone({
   *       setHeaders: { Authorization: `Bearer ${token}` }
   *     });
   *   }
   */

  // Log za debugging
  console.log('Interceptor: Request intercepted', req.url);

  // Nadaljuj z originalno zahtevo (brez modifikacij)
  // next(req) pošlje zahtevo naprej v verigi
  return next(req);
};
