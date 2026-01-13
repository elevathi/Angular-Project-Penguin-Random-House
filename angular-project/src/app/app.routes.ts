/**
 * =============================================================================
 * APP ROUTES - KONFIGURACIJA USMERJANJA (ROUTING)
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. Routes array       - Definicija poti aplikacije
 * 2. Lazy Loading       - Nalaganje komponent na zahtevo
 * 3. Route Guards       - Zaščita poti (canActivate)
 * 4. Route Parameters   - Dinamični parametri (:isbn, :authorid)
 * 5. Wildcard Route     - Lovljenje neobstoječih poti (**)
 * 6. Redirects          - Preusmeritve
 *
 * KAKO DELUJE ROUTING:
 * --------------------
 *
 *   URL: /search
 *      │
 *      ▼
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Angular Router pregleda routes array                       │
 *   │                                                             │
 *   │  1. path: ''        → redirectTo: 'search'                 │
 *   │  2. path: 'login'   → LoginComponent                       │
 *   │  3. path: 'search'  → SearchComponent ← MATCH!             │
 *   │  4. path: '**'      → NotFoundComponent (fallback)         │
 *   └─────────────────────────────────────────────────────────────┘
 *      │
 *      ▼
 *   canActivate: [authGuard]
 *      │
 *      ├── true  → Naloži komponento
 *      └── false → Preusmeri na /login
 *
 * LAZY LOADING:
 * -------------
 * loadComponent: () => import('./path').then(m => m.Component)
 *
 * Komponenta se NE naloži ob zagonu aplikacije!
 * Naloži se šele, ko uporabnik obišče to pot.
 *
 * Prednosti:
 * - Manjši začetni bundle (hitrejši prvi load)
 * - Boljša uporabniška izkušnja
 * - Komponente se naložijo "on demand"
 *
 * =============================================================================
 */

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * ROUTES ARRAY:
 * =============
 * Vsak objekt v arrayu predstavlja eno pot (route).
 *
 * Lastnosti:
 * - path: URL pot (brez vodilne /)
 * - loadComponent: Lazy loading funkcija
 * - canActivate: Array route guardov
 * - redirectTo: Preusmeritev na drugo pot
 * - pathMatch: 'full' | 'prefix'
 */
export const routes: Routes = [

  // ===========================================================================
  // REDIRECT - Preusmeritev
  // ===========================================================================
  /**
   * Prazna pot (/) se preusmeri na /search
   *
   * pathMatch: 'full' - ujemi CELOTNO pot, ne samo prefix
   *   '/'      → match (preusmeri)
   *   '/abc'   → NE match (ne preusmeri)
   */
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },

  // ===========================================================================
  // LOGIN - Brez zaščite (javna pot)
  // ===========================================================================
  /**
   * LAZY LOADING:
   * =============
   * loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
   *
   * To je funkcija, ki:
   * 1. Dinamično uvozi modul: import('./pages/login/login')
   * 2. Vrne Promise
   * 3. Ko se Promise razreši, vzame LoginComponent iz modula
   *
   * Brez canActivate - vsakdo lahko dostopa do login strani
   */
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },

  // ===========================================================================
  // SEARCH - Zaščitena pot
  // ===========================================================================
  /**
   * canActivate: [authGuard]
   * ========================
   * Route Guard - funkcija, ki preveri, če uporabnik sme dostopati.
   *
   * authGuard preveri:
   *   - Je uporabnik prijavljen?
   *   - Če DA → vrne true → komponenta se naloži
   *   - Če NE → preusmeri na /login → vrne false
   */
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then(m => m.SearchComponent),
    canActivate: [authGuard]  // Zaščitena pot!
  },

  // ===========================================================================
  // ROUTE PARAMETERS - Dinamični parametri
  // ===========================================================================
  /**
   * path: 'author/:authorid'
   * ========================
   * :authorid je ROUTE PARAMETER - dinamični del URL-ja
   *
   * Primeri:
   *   /author/12345  → authorid = "12345"
   *   /author/67890  → authorid = "67890"
   *
   * V komponenti prebereš parameter:
   *   const authorId = this.route.snapshot.paramMap.get('authorid');
   *
   * Ali reaktivno:
   *   this.route.paramMap.subscribe(params => {
   *     const authorId = params.get('authorid');
   *   });
   */
  {
    path: 'author/:authorid',
    loadComponent: () => import('./pages/author-detail/author-detail').then(m => m.AuthorDetailComponent),
    canActivate: [authGuard]
  },

  /**
   * :isbn - ISBN knjige kot route parameter
   */
  {
    path: 'title/:isbn',
    loadComponent: () => import('./pages/title-detail/title-detail').then(m => m.TitleDetailComponent),
    canActivate: [authGuard]
  },

  // ===========================================================================
  // WILDCARD - Ujemi vse ostalo
  // ===========================================================================
  /**
   * path: '**'
   * ==========
   * Wildcard route - ujame VSE poti, ki se ne ujemajo z drugimi.
   *
   * POMEMBNO: Mora biti ZADNJA v arrayu!
   * Angular preverja poti od vrha navzdol.
   *
   * Uporaba: 404 stran za neobstoječe URL-je
   *
   * Primeri:
   *   /neobstaja      → NotFoundComponent
   *   /foo/bar/baz    → NotFoundComponent
   *   /anything       → NotFoundComponent
   */
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
  }
];
