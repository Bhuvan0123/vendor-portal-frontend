import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'finance',
    canActivate: [authGuard],
    loadComponent: () => import('./features/finance/finance.component').then((m) => m.FinanceComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'invoices'
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/finance/invoices/invoices.component').then((m) => m.InvoicesComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/finance/payments/payments.component').then((m) => m.PaymentsComponent)
      },
      {
        path: 'memo',
        loadComponent: () => import('./features/finance/memo/memo.component').then((m) => m.MemoComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
