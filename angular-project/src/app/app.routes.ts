import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then(m => m.SearchComponent),
    canActivate: [authGuard]
  },
  {
    path: 'author/:authorid',
    loadComponent: () => import('./pages/author-detail/author-detail').then(m => m.AuthorDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'title/:isbn',
    loadComponent: () => import('./pages/title-detail/title-detail').then(m => m.TitleDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
  }
];