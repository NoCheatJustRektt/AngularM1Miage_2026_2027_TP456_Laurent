import type { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    title: 'Accueil · StudyShare',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
];
