import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="finance-shell">
      <nav class="tabs">
        <a routerLink="/finance/invoices" routerLinkActive="active">Invoices</a>
        <a routerLink="/finance/payments" routerLinkActive="active">Payments / Aging</a>
        <a routerLink="/finance/memo" routerLinkActive="active">Memo / Credit Notes</a>
      </nav>

      <div class="tab-body">
        <router-outlet></router-outlet>
      </div>
    </section>
  `,
  styles: [
    `
      .finance-shell {
        display: grid;
        gap: 14px;
      }
      .tabs {
        display: flex;
        gap: 22px;
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 12px 18px;
      }
      .tabs a {
        text-decoration: none;
        color: var(--clr-400);
        padding-bottom: 8px;
        border-bottom: 2px solid transparent;
      }
      .tabs a.active {
        color: var(--clr-600);
        font-weight: 600;
        border-bottom-color: var(--clr-500);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceComponent {}
