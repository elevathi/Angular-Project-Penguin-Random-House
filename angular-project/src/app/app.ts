import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html'
})
export class App {
  /**
   * Cache preloading disabled - cache loads on-demand when user searches
   * This makes app startup instant, but first search will take ~60-90 seconds
   */
}