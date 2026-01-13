/**
 * =============================================================================
 * ERROR INTERCEPTOR - PRESTREZNIK NAPAK
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. HttpInterceptorFn   - Funkcijski HTTP interceptor
 * 2. RxJS catchError     - Lovljenje napak v Observable toku
 * 3. throwError          - Emitiranje napake v Observable
 * 4. HttpErrorResponse   - Tip za HTTP napake
 * 5. inject()            - DI v funkcijah
 *
 * NAMEN:
 * ------
 * Ta interceptor prestreže VSE HTTP napake in jih:
 * - Logira v konzolo
 * - Pretvori v uporabniku prijazna sporočila
 * - Preusmeri na login pri 401 (Unauthorized)
 *
 * KAKO DELUJE catchError:
 * -----------------------
 *
 *   next(req).pipe(
 *     catchError((error) => {
 *       // Obdelaj napako
 *       return throwError(() => new Error('Sporočilo'));
 *     })
 *   );
 *
 * catchError prestreže napako iz Observable toka.
 * Lahko jo:
 *   - Transformira v drugo napako (throwError)
 *   - Nadomesti z drugo vrednostjo (of(fallbackValue))
 *   - Ponovi zahtevo (retry)
 *
 * HTTP STATUS KODE:
 * -----------------
 * - 0:   Ni povezave (network error)
 * - 401: Unauthorized - uporabnik ni prijavljen
 * - 403: Forbidden - nima pravic
 * - 404: Not Found - vir ne obstaja
 * - 429: Too Many Requests - rate limiting
 * - 500: Internal Server Error
 * - 503: Service Unavailable
 *
 * =============================================================================
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * ERROR INTERCEPTOR:
 * ==================
 *
 * Prestreže HTTP napake in jih pretvori v uporabniku prijazna sporočila.
 *
 * Deluje kot "catch" blok za vse HTTP klice v aplikaciji.
 * Namesto da bi vsaka komponenta posebej obdelovala napake,
 * jih centralizirano obdelamo tukaj.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject Router za preusmeritev pri 401
  const router = inject(Router);

  /**
   * next(req) vrne Observable<HttpEvent>
   *
   * .pipe() omogoča veriženje RxJS operatorjev
   *
   * catchError() prestreže napake in omogoča:
   * - Transformacijo napake
   * - Logiranje
   * - Recovery (povrnitev z drugo vrednostjo)
   */
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Prišlo je do napake';

      /**
       * TIPI NAPAK:
       * ===========
       *
       * 1. Client-side error (ErrorEvent)
       *    - Network error
       *    - CORS error
       *    - JavaScript error v HTTP klicu
       *
       * 2. Server-side error (HttpErrorResponse)
       *    - Server vrne status kodo >= 400
       *    - Timeout
       *    - Server ni dosegljiv
       */
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Napaka: ${error.error.message}`;
        console.error('Client error:', error.error.message);
      } else {
        // Server-side error
        console.error(`Server error: ${error.status} - ${error.statusText}`);

        /**
         * OBDELAVA GLEDE NA STATUS KODO:
         * ==============================
         * Vsaka HTTP status koda ima svoj pomen.
         * Uporabniku prikažemo razumljivo sporočilo.
         */
        switch (error.status) {
          case 0:
            // Network error - brskalnik ni mogel poslati zahteve
            errorMessage = 'Ni povezave s strežnikom. Preverite internetno povezavo.';
            break;

          case 401:
            // Unauthorized - uporabnik ni prijavljen ali je token potekel
            errorMessage = 'Nimate pravic za dostop. Prosimo, prijavite se.';
            // Preusmeri na login
            router.navigate(['/login']);
            break;

          case 403:
            // Forbidden - uporabnik je prijavljen, ampak nima pravic
            errorMessage = 'Dostop zavrnjen.';
            break;

          case 404:
            // Not Found - zahtevani vir ne obstaja
            errorMessage = 'Iskani vir ni bil najden.';
            break;

          case 429:
            // Too Many Requests - rate limiting
            errorMessage = 'Preveč zahtevkov. Počakajte trenutek in poskusite znova.';
            break;

          case 500:
            // Internal Server Error - napaka na strežniku
            errorMessage = 'Napaka na strežniku. Poskusite pozneje.';
            break;

          case 503:
            // Service Unavailable - strežnik začasno ni na voljo
            errorMessage = 'Storitev ni na voljo. Poskusite pozneje.';
            break;

          default:
            // Vse ostale napake
            errorMessage = `Napaka ${error.status}: ${error.statusText}`;
        }
      }

      /**
       * throwError:
       * ===========
       * Ustvari Observable, ki takoj emitira napako.
       *
       * Komponenta, ki se subscribe-a, bo prejela to napako
       * v error callback-u:
       *
       *   .subscribe({
       *     next: (data) => { ... },
       *     error: (err) => {
       *       // err.message = 'Napaka na strežniku.'
       *       this.errorMessage = err.message;
       *     }
       *   });
       */
      return throwError(() => new Error(errorMessage));
    })
  );
};
