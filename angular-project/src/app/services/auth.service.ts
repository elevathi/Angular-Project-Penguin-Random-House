/**
 * =============================================================================
 * AUTH SERVICE - STORITEV ZA AVTENTIKACIJO
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. @Injectable({ providedIn: 'root' }) - Singleton storitev
 * 2. Angular Signals - Reaktivno stanje
 * 3. JWT Token Management - Shranjevanje in branje tokenov
 * 4. localStorage - Persistenca podatkov med sejami
 *
 * KAJ JE STORITEV (SERVICE)?
 * --------------------------
 * Storitev je razred, ki vsebuje:
 * - Poslovno logiko (authentication, API calls)
 * - Podatke, ki jih delijo več komponente
 * - Metode za manipulacijo podatkov
 *
 * Prednosti:
 * - Ločitev logike od komponent (separation of concerns)
 * - Deljenje podatkov med komponentami
 * - Lažje testiranje (mockanje)
 *
 * KAKO DELUJE providedIn: 'root'?
 * -------------------------------
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │                  Angular Aplikacija (root)                  │
 *   │                                                              │
 *   │   providedIn: 'root' = ENA instanca za VSE komponente       │
 *   │                                                              │
 *   │        ┌──────────────────────┐                             │
 *   │        │     AuthService      │ ← Singleton!                │
 *   │        │    (ena instanca)    │                             │
 *   │        └──────────┬───────────┘                             │
 *   │                   │                                          │
 *   │     ┌─────────────┼─────────────┬─────────────┐             │
 *   │     ▼             ▼             ▼             ▼             │
 *   │  Login        Navbar        Search       TitleDetail        │
 *   │  Component   Component    Component      Component          │
 *   │                                                              │
 *   │  Vse komponente delijo ISTO instanco AuthService!           │
 *   │  Če Login nastavi isLoggedIn = true, Navbar to vidi.        │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * =============================================================================
 */

import { Injectable, signal } from '@angular/core';
import { User, LoginCredentials } from '../models/user.model';

/**
 * @Injectable DEKORATOR:
 * ======================
 * Pove Angularju, da je ta razred "injectable" - da ga lahko vstavi
 * v druge razrede preko Dependency Injection.
 *
 * providedIn: 'root':
 * - Storitev je registrirana na root nivoju
 * - Ustvari se ENA sama instanca (Singleton pattern)
 * - Dostopna vsem komponentam v aplikaciji
 * - Angular jo ustvari "lazy" - šele ko jo nekdo potrebuje
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // ===========================================================================
  // ANGULAR SIGNALS - REAKTIVNO STANJE
  // ===========================================================================
  /**
   * SIGNAL je Angular-ov način za reaktivno stanje.
   *
   * signal<T>(initialValue) - ustvari signal s privzeto vrednostjo
   *
   * Prednosti pred navadnimi spremenljivkami:
   * - Angular ve kdaj se vrednost spremeni
   * - Lahko sproži posodobitev komponente
   * - Lažje sledenje spremembam
   *
   * Uporaba:
   *   Branje:  this.currentUser()      ← pokliči kot funkcijo
   *   Pisanje: this.currentUser.set(user)
   */
  private currentUser = signal<User | null>(null);

  /**
   * Javni signal za preverjanje prijave
   * Komponente lahko direktno berejo: authService.isLoggedIn()
   */
  isLoggedIn = signal<boolean>(false);

  // ===========================================================================
  // KONSTRUKTOR
  // ===========================================================================
  /**
   * Konstruktor se izvede ob ustvarjanju storitve.
   * Preverimo, če je token že shranjen (uporabnik je bil prijavljen)
   */
  constructor() {
    this.checkStoredToken();
  }

  // ===========================================================================
  // PRIVATNE METODE
  // ===========================================================================
  /**
   * Preveri če obstaja shranjen token v localStorage
   * Če obstaja, obnovi stanje prijave
   */
  private checkStoredToken(): void {
    const token = localStorage.getItem('jwt_token');
    const username = localStorage.getItem('username');

    if (token && username) {
      // Token obstaja - uporabnik je prijavljen
      this.currentUser.set({ username, token });
      this.isLoggedIn.set(true);
    }
  }

  // ===========================================================================
  // JAVNE METODE
  // ===========================================================================

  /**
   * PRIJAVA UPORABNIKA
   * ==================
   *
   * V produkcijski aplikaciji bi tukaj bil HTTP klic na backend:
   *   return this.http.post('/api/login', credentials).pipe(
   *     tap(response => {
   *       localStorage.setItem('jwt_token', response.token);
   *       this.currentUser.set(response.user);
   *     })
   *   );
   *
   * JWT (JSON Web Token):
   * - Standard za varen prenos informacij
   * - Vsebuje: header.payload.signature
   * - Shranimo ga v localStorage za persistenco
   *
   * @param credentials - uporabniško ime in geslo
   * @returns true če je prijava uspešna, false sicer
   */
  login(credentials: LoginCredentials): boolean {
    // Mock authentication - v realnosti bi bil HTTP klic
    if (credentials.username && credentials.password.length >= 4) {
      // Ustvari "fake" JWT token (base64 encoded)
      // V realnosti bi to prišlo iz backend API-ja
      const fakeToken = btoa(`${credentials.username}:${Date.now()}`);

      const user: User = {
        username: credentials.username,
        token: fakeToken,
      };

      // Shrani v localStorage za persistenco med sejami
      localStorage.setItem('jwt_token', fakeToken);
      localStorage.setItem('username', credentials.username);

      // Posodobi reaktivno stanje
      this.currentUser.set(user);
      this.isLoggedIn.set(true);

      return true;
    }
    return false;
  }

  /**
   * ODJAVA UPORABNIKA
   * =================
   * Odstrani token in ponastavi stanje
   */
  logout(): void {
    // Odstrani iz localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');

    // Ponastavi reaktivno stanje
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  /**
   * Vrne JWT token (za interceptor)
   * Interceptor doda token v Authorization header
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Vrne trenutnega uporabnika
   * currentUser() - klic signala vrne vrednost
   */
  getUser(): User | null {
    return this.currentUser();
  }
}
