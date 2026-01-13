/**
 * =============================================================================
 * TITLE CARD COMPONENT
 * =============================================================================
 *
 * DEMONSTRIRANI KONCEPTI:
 * -----------------------
 * 1. @Input()  - Sprejem podatkov od starša (title objekt)
 * 2. @Output() - Pošiljanje dogodkov staršu (titleSelected)
 * 3. Dependency Injection - Vstavljanje PrhApiService v konstruktor
 * 4. Event Binding - Odziv na (click) in (error) dogodke
 *
 * KAKO DELUJE KOMUNIKACIJA MED KOMPONENTAMI:
 * ------------------------------------------
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │                    SearchComponent (STARŠ)                  │
 *   │                                                             │
 *   │  <app-title-card                                           │
 *   │      [title]="selectedTitle"      ← @Input(): pošlje title │
 *   │      (titleSelected)="onSelect($event)">  ← @Output()      │
 *   │  </app-title-card>                                          │
 *   │                                                             │
 *   │  onSelect(title: Title) {                                  │
 *   │    this.router.navigate(['/title', title.isbn]);           │
 *   │  }                                                          │
 *   └─────────────────────────────────────────────────────────────┘
 *                            │ [title]           ▲ (titleSelected)
 *                            ▼                   │
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │                   TitleCardComponent (OTROK)                │
 *   │                                                             │
 *   │  @Input() title: Title;        ← Prejme podatke            │
 *   │  @Output() titleSelected = new EventEmitter<Title>();      │
 *   │                                                             │
 *   │  onTitleClick() {                                          │
 *   │    this.titleSelected.emit(this.title);  ← Pošlje staršu  │
 *   │  }                                                          │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * =============================================================================
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '../../models/title.model';
import { PrhApiService } from '../../services/prh-api.service';

@Component({
  selector: 'app-title-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './title-card.html',
  styleUrl: './title-card.css'
})
export class TitleCardComponent {

  // ===========================================================================
  // @INPUT() - SPREJEM PODATKOV OD STARŠA
  // ===========================================================================
  /**
   * @Input({ required: true }) - dekorator z opcijo required
   *
   * required: true - TypeScript javi napako, če starš ne poda tega inputa
   *
   * title!: Title - klicaj (!) je "definite assignment assertion"
   *                 Pove TypeScriptu: "Vem, da bo ta vrednost nastavljena"
   *
   * Uporaba v staršu:
   *   <app-title-card [title]="myTitle"></app-title-card>
   */
  @Input({ required: true }) title!: Title;

  // ===========================================================================
  // @OUTPUT() - POŠILJANJE DOGODKOV STARŠU
  // ===========================================================================
  /**
   * EventEmitter<Title> - generični razred za emitiranje dogodkov
   *
   * <Title> - tip podatkov, ki jih pošiljamo (lahko je karkoli)
   *
   * Uporaba v staršu:
   *   <app-title-card (titleSelected)="onTitleSelected($event)">
   *
   * $event bo tipa Title
   */
  @Output() titleSelected = new EventEmitter<Title>();

  // ===========================================================================
  // PLACEHOLDER SLIKA (SVG data URL)
  // ===========================================================================
  /**
   * Data URL za SVG sliko, ki se prikaže če prava slika ne obstaja
   * Izognemo se zunanjim odvisnostim
   */
  private readonly placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='180' viewBox='0 0 120 180'%3E%3Crect fill='%23e9ecef' width='120' height='180'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-family='sans-serif' font-size='12'%3ENo%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-family='sans-serif' font-size='12'%3ECover%3C/text%3E%3C/svg%3E`;

  // ===========================================================================
  // DEPENDENCY INJECTION (DI)
  // ===========================================================================
  /**
   * KONSTRUKTOR Z DEPENDENCY INJECTION:
   * ===================================
   * Angular samodejno vstavi instanco PrhApiService.
   *
   * private prhApiService: PrhApiService
   *   - private = dostopno samo znotraj razreda
   *   - Angular pogleda v "injector" in najde PrhApiService
   *   - Ker ima PrhApiService { providedIn: 'root' }, je singleton
   *
   * Alternativna moderna sintaksa (brez konstruktorja):
   *   private prhApiService = inject(PrhApiService);
   */
  constructor(private prhApiService: PrhApiService) {}

  // ===========================================================================
  // METODE
  // ===========================================================================

  /**
   * Vrne URL naslovnice knjige
   * Kliče se iz predloge: [src]="getCoverUrl()"
   */
  getCoverUrl(): string {
    return this.prhApiService.getCoverImageUrl(this.title.isbn);
  }

  /**
   * EVENT HANDLER za napako pri nalaganju slike
   *
   * Uporaba v predlogi:
   *   <img (error)="onImageError($event)">
   *
   * $event je originalni DOM Event objekt
   * Če slika ne obstaja, nastavimo placeholder
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholderImage;
  }

  /**
   * EVENT HANDLER za klik na kartico
   *
   * Uporaba v predlogi:
   *   <div (click)="onTitleClick()">
   *
   * Ko uporabnik klikne, emitiramo title staršu
   * Starš se nato odloči kaj narediti (npr. navigacija)
   */
  onTitleClick(): void {
    this.titleSelected.emit(this.title);
  }

  /**
   * Pretvori USD ceno v EUR
   * Uporabi statično metodo iz storitve
   */
  getEurPrice(): string {
    return PrhApiService.convertUsdToEur(this.title.priceusa);
  }
}
