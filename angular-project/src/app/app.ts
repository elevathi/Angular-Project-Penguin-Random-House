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
  constructor(private prhApiService: PrhApiService) {}

  /**
   * Preload cache in background on app startup
   * This ensures search is instant when user needs it
   */
  ngOnInit(): void {
    console.log('🚀 App initialized - preloading search caches in background...');
    this.prhApiService.preloadCaches();
  }
}