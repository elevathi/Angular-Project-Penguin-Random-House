import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { environment } from '../environments/environment';
import { PrhApiService } from './services/prh-api.service';
import { MockPrhApiService } from './mocks/mock-prh-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Conditionally provide mock or real API service
    environment.useMockData
      ? { provide: PrhApiService, useClass: MockPrhApiService }
      : PrhApiService
  ]
};