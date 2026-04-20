import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FinanceSummaryWidgetComponent } from './widgets/finance-summary-widget/finance-summary-widget.component';
import { RfqWidgetComponent } from './widgets/rfq-widget/rfq-widget.component';
import { PoWidgetComponent } from './widgets/po-widget/po-widget.component';
import { GrWidgetComponent } from './widgets/gr-widget/gr-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FinanceSummaryWidgetComponent, RfqWidgetComponent, PoWidgetComponent, GrWidgetComponent],
  template: `
    <section class="dash">
      <header>
        <h1>Dashboard</h1>
        <p>{{ today | date : 'EEEE, d MMMM y' }}</p>
      </header>

      <app-finance-summary-widget></app-finance-summary-widget>

      <section class="insight-card">
        <h3>Workspace Insights</h3>
        <div class="insight-grid">
          <div class="insight"><span>RFQ</span><div class="line l1"></div></div>
          <div class="insight"><span>PO</span><div class="line l2"></div></div>
          <div class="insight"><span>GR</span><div class="line l3"></div></div>
          <div class="insight"><span>Finance</span><div class="line l4"></div></div>
        </div>
      </section>

      <section class="widget-shell">
        <nav class="tabs">
          <button type="button" [class.active]="activeTab() === 'rfq'" (click)="activeTab.set('rfq')">Request for Quotation</button>
          <button type="button" [class.active]="activeTab() === 'po'" (click)="activeTab.set('po')">Purchase Order</button>
          <button type="button" [class.active]="activeTab() === 'gr'" (click)="activeTab.set('gr')">Goods Receipt</button>
        </nav>

        <div class="panel">
          <app-rfq-widget *ngIf="activeTab() === 'rfq'"></app-rfq-widget>
          <app-po-widget *ngIf="activeTab() === 'po'"></app-po-widget>
          <app-gr-widget *ngIf="activeTab() === 'gr'"></app-gr-widget>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .dash {
        display: grid;
        gap: 18px;
      }
      h1 {
        margin: 0;
        color: var(--clr-700);
      }
      p {
        margin: 0;
        color: var(--clr-500);
      }

      .widget-shell {
        display: grid;
        gap: 12px;
      }

      .insight-card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 14px 16px;
      }

      .insight-card h3 {
        margin: 0 0 10px;
        color: var(--clr-700);
        font-size: 14px;
      }

      .insight-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .insight {
        background: var(--clr-50);
        border-radius: var(--radius-md);
        padding: 10px;
      }

      .insight span {
        color: var(--clr-600);
        font-weight: 600;
      }

      .line {
        margin-top: 8px;
        height: 8px;
        border-radius: 8px;
      }

      .l1 {
        width: 75%;
        background: var(--clr-500);
      }

      .l2 {
        width: 58%;
        background: var(--clr-400);
      }

      .l3 {
        width: 42%;
        background: var(--clr-300);
      }

      .l4 {
        width: 88%;
        background: var(--clr-600);
      }

      .tabs {
        display: flex;
        gap: 22px;
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 12px 18px;
      }

      .tabs button {
        background: transparent;
        color: var(--clr-400);
        padding: 0 0 8px;
        border-radius: 0;
        border-bottom: 2px solid transparent;
        box-shadow: none;
        transform: none;
      }

      .tabs button:hover {
        background: transparent;
        color: var(--clr-600);
        box-shadow: none;
        transform: none;
      }

      .tabs button.active {
        color: var(--clr-600);
        font-weight: 600;
        border-bottom-color: var(--clr-500);
      }

      .panel {
        min-height: 320px;
      }

      @media (max-width: 767px) {
        .insight-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .tabs {
          gap: 14px;
          padding: 10px 12px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly today = new Date();
  readonly activeTab = signal<'rfq' | 'po' | 'gr'>('rfq');
}
