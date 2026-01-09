import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.html'

})
export class LoaderComponent {
  @Input() message = 'Nalaganje...';
  @Input() height = '200px';
}