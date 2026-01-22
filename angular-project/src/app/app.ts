import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PrhApiService } from './services/prh-api.service';

@Component({
  selector: 'app',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html'
})
export class App implements OnInit {
  /**
   * Inject PrhApiService to preload caches on app startup
   */
  constructor(private prhApiService: PrhApiService) {}

  /**
   * Preload authors and titles cache in the background
   * This ensures instant search results without waiting on first search
   */
  ngOnInit(): void {
    console.log('🚀 App initialized - preloading search caches...');
    this.prhApiService.preloadCaches();
  }
}