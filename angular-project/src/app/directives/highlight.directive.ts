/**
 * =============================================================================
 * HIGHLIGHT DIRECTIVE - LASTNA (CUSTOM) ATRIBUTNA DIREKTIVA
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. @Directive          - Dekorator za direktive
 * 2. Atributni selector  - [appHighlight]
 * 3. @Input()            - Konfiguracija direktive
 * 4. @HostListener       - Poslušanje DOM dogodkov
 * 5. ElementRef          - Direkten dostop do DOM elementa
 *
 * KAJ JE ATRIBUTNA DIREKTIVA?
 * ---------------------------
 * Atributna direktiva SPREMINJA obnašanje/videz obstoječih elementov.
 * Ne ustvarja novih elementov (to delajo strukturne direktive).
 *
 * Vgrajene atributne direktive:
 *   - ngClass - dinamično dodajanje CSS razredov
 *   - ngStyle - dinamično dodajanje stilov
 *
 * KAKO UPORABITI LASTNO DIREKTIVO:
 * --------------------------------
 *
 *   <!-- Osnovna uporaba -->
 *   <div appHighlight>Vsebina</div>
 *
 *   <!-- S custom barvo -->
 *   <div appHighlight="#fff3e0">Vsebina</div>
 *
 *   <!-- Z barvo besedila -->
 *   <div appHighlight="#fff3e0" highlightTextColor="#333">Vsebina</div>
 *
 * KAKO DELUJE:
 * ------------
 *
 *   <div appHighlight="#fff3e0">
 *     │
 *     ▼
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Angular najde element z atributom [appHighlight]          │
 *   │                                                             │
 *   │  Ustvari instanco HighlightDirective                       │
 *   │                                                             │
 *   │  @Input() appHighlight = "#fff3e0"  ← Nastavi barvo        │
 *   │                                                             │
 *   │  @HostListener('mouseenter')                               │
 *   │    → Spremeni backgroundColor na #fff3e0                   │
 *   │                                                             │
 *   │  @HostListener('mouseleave')                               │
 *   │    → Povrni originalno barvo                               │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * =============================================================================
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * @Directive DEKORATOR:
 * =====================
 *
 * selector: '[appHighlight]'
 *   - Atributni selector (v oglatih oklepajih)
 *   - Direktiva se aktivira na elementih z atributom appHighlight
 *   - <div appHighlight> ← direktiva se poveže s tem elementom
 *
 * standalone: true
 *   - Samostojna direktiva (brez NgModule)
 *   - Lahko jo direktno uvozimo v komponente
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {

  // ===========================================================================
  // @INPUT() - KONFIGURACIJA DIREKTIVE
  // ===========================================================================
  /**
   * @Input() appHighlight
   * ======================
   * Ime inputa je ENAKO kot ime selektorja!
   * To omogoča krajšo sintakso:
   *
   *   <div appHighlight="#fff3e0">
   *
   * Namesto:
   *   <div appHighlight [highlightColor]="#fff3e0">
   *
   * Privzeta vrednost: '#f0f0f0' (svetlo siva)
   */
  @Input() appHighlight = '#f0f0f0';

  /**
   * Dodatni input za barvo besedila
   */
  @Input() highlightTextColor = '#000';

  /**
   * Shranimo originalne vrednosti za povrnitev
   */
  private originalBackground = '';
  private originalColor = '';

  // ===========================================================================
  // ELEMENTREF - DOSTOP DO DOM ELEMENTA
  // ===========================================================================
  /**
   * ElementRef je referenca na DOM element, na katerem je direktiva.
   *
   * Angular jo vstavi preko Dependency Injection.
   *
   * el.nativeElement - dejanski DOM HTMLElement
   *
   * OPOZORILO:
   * Direkten dostop do DOM-a (nativeElement) ni priporočljiv
   * za kompleksnejše operacije. Uporabi Renderer2 za boljšo
   * kompatibilnost (SSR, Web Workers).
   *
   * Za preproste operacije kot je ta direktiva, je OK.
   */
  constructor(private el: ElementRef) {}

  // ===========================================================================
  // @HOSTLISTENER - POSLUŠANJE DOM DOGODKOV
  // ===========================================================================
  /**
   * @HostListener('eventName') methodName()
   * =======================================
   * Posluša DOM dogodek na HOST elementu (elementu z direktivo).
   *
   * 'mouseenter' - miška vstopi v element
   * 'mouseleave' - miška zapusti element
   *
   * Alternativa za addEventListener(), ki jo Angular upravlja
   * (samodejno odstrani listener ob uničenju direktive).
   */

  /**
   * Ko miška vstopi v element:
   * 1. Shrani originalne barve
   * 2. Nastavi nove barve (highlight)
   */
  @HostListener('mouseenter') onMouseEnter() {
    // Shrani originalne vrednosti
    this.originalBackground = this.el.nativeElement.style.backgroundColor;
    this.originalColor = this.el.nativeElement.style.color;

    // Nastavi highlight barve
    this.highlight(this.appHighlight, this.highlightTextColor);
  }

  /**
   * Ko miška zapusti element:
   * Povrni originalne barve
   */
  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.originalBackground, this.originalColor);
  }

  // ===========================================================================
  // PRIVATNA METODA ZA SPREMEMBO STILOV
  // ===========================================================================
  /**
   * Spremeni background in text color elementa
   *
   * el.nativeElement.style - dostop do CSS stilov
   * transition - gladka animacija spremembe
   */
  private highlight(bgColor: string, textColor: string) {
    this.el.nativeElement.style.backgroundColor = bgColor;
    this.el.nativeElement.style.color = textColor;
    this.el.nativeElement.style.transition = 'all 0.3s ease';
  }
}
