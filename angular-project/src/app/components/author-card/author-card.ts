import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Author } from '../../models/author.model';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-author-card',
  imports: [CommonModule, HighlightDirective],
  template: `
    <div 
      class="card h-100 cursor-pointer" 
      appHighlight="#e3f2fd"
      (click)="onAuthorClick()">
      <div class="card-body">
        <h5 class="card-title">
          <i class="bi bi-person me-2"></i>
          {{ author.authordisplay }}
        </h5>
        <p class="card-text text-muted small">
          ID: {{ author.authorid }}
        </p>
        @if (author.spotlight) {
          <p class="card-text small" [innerHTML]="author.spotlight | slice:0:150"></p>
        }
      </div>
      <div class="card-footer bg-transparent">
        <small class="text-muted">
          Klikni za podrobnosti
        </small>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  `]
})
export class AuthorCardComponent {
  @Input({ required: true }) author!: Author;
  @Output() authorSelected = new EventEmitter<Author>();

  onAuthorClick(): void {
    this.authorSelected.emit(this.author);
  }
}