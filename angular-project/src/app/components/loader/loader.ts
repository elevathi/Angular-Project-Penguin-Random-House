import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-center align-items-center" [style.height]="height">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ message }}</span>
      </div>
      <span class="ms-3">{{ message }}</span>
    </div>
  `
})
export class LoaderComponent {
  @Input() message = 'Nalaganje...';
  @Input() height = '200px';
}