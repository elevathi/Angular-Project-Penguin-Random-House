import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Prišlo je do napake';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Napaka: ${error.error.message}`;
        console.error('Client error:', error.error.message);
      } else {
        // Server-side error
        console.error(`Server error: ${error.status} - ${error.statusText}`);

        switch (error.status) {
          case 0:
            errorMessage = 'Ni povezave s strežnikom. Preverite internetno povezavo.';
            break;
          case 401:
            errorMessage = 'Nimate pravic za dostop. Prosimo, prijavite se.';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Dostop zavrnjen.';
            break;
          case 404:
            errorMessage = 'Iskani vir ni bil najden.';
            break;
          case 429:
            errorMessage = 'Preveč zahtevkov. Počakajte trenutek in poskusite znova.';
            break;
          case 500:
            errorMessage = 'Napaka na strežniku. Poskusite pozneje.';
            break;
          case 503:
            errorMessage = 'Storitev ni na voljo. Poskusite pozneje.';
            break;
          default:
            errorMessage = `Napaka ${error.status}: ${error.statusText}`;
        }
      }

      // Return error with user-friendly message
      return throwError(() => new Error(errorMessage));
    })
  );
};
