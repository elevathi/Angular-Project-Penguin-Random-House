import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Author } from '../../models/author.model';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-author-card',
  imports: [CommonModule, HighlightDirective],
})
export class AuthorCardComponent {
  @Input({ required: true }) author!: Author;
  @Output() authorSelected = new EventEmitter<Author>();

  onAuthorClick(): void {
    this.authorSelected.emit(this.author);
  }
}
