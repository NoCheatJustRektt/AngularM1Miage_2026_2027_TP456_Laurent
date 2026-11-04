import type { Routes } from '@angular/router';

// Chaque fonctionnalité est chargée à la demande (voir docs/ARCHITECTURE.md, « Front-end »).
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
