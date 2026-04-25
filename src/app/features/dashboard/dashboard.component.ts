import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FinanceSummaryWidgetComponent } from './widgets/finance-summary-widget/finance-summary-widget.component';
import { RfqWidgetComponent } from './widgets/rfq-widget/rfq-widget.component';
import { PoWidgetComponent } from './widgets/po-widget/po-widget.component';
import { GrWidgetComponent } from './widgets/gr-widget/gr-widget.component';
import { AuthService } from '../../core/services/auth.service';
import { RfqService } from '../../core/services/rfq.service';
import { PoService } from '../../core/services/po.service';
import { GrService } from '../../core/services/gr.service';
import { FinanceService } from '../../core/services/finance.service';
import { forkJoin } from 'rxjs';

type InsightMetric = {
  label: string;
  value: number;
  toneClass: 'l1' | 'l2' | 'l3' | 'l4';
};

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
          <div class="insight" *ngFor="let metric of insights(); trackBy: trackByLabel">
            <div class="insight-head">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </div>
            <div class="line-track">
              <div class="line" [ngClass]="metric.toneClass" [style.width.%]="insightWidth(metric.value)"></div>
            </div>
          </div>
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

      .insight-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }

      .insight span {
        color: var(--clr-600);
        font-weight: 600;
      }

      .insight strong {
        color: var(--clr-700);
        font-size: 18px;
        line-height: 1;
      }

      .line-track {
        margin-top: 8px;
        height: 8px;
        border-radius: 8px;
        overflow: hidden;
        background: var(--clr-200);
      }

      .line {
        height: 8px;
        border-radius: 8px;
        transition: width 0.35s ease;
      }

      .l1 {
        background: var(--clr-500);
      }

      .l2 {
        background: var(--clr-400);
      }

      .l3 {
        background: var(--clr-300);
      }

      .l4 {
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
export class DashboardComponent implements OnInit {
  readonly today = new Date();
  readonly activeTab = signal<'rfq' | 'po' | 'gr'>('rfq');
  readonly insights = signal<InsightMetric[]>([
    { label: 'RFQ', value: 0, toneClass: 'l1' },
    { label: 'PO', value: 0, toneClass: 'l2' },
    { label: 'GR', value: 0, toneClass: 'l3' },
    { label: 'Finance', value: 0, toneClass: 'l4' }
  ]);
  readonly maxInsightValue = computed(() => Math.max(...this.insights().map((metric) => metric.value), 0));

  constructor(
    private readonly auth: AuthService,
    private readonly rfqService: RfqService,
    private readonly poService: PoService,
    private readonly grService: GrService,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit(): void {
    const vendorId = this.auth.getVendorId();
    forkJoin({
      rfq: this.rfqService.getHeaders(vendorId),
      po: this.poService.getHeaders(vendorId),
      gr: this.grService.getHeaders(vendorId),
      invoices: this.financeService.getInvoices(vendorId)
    }).subscribe(({ rfq, po, gr, invoices }) => {
      this.insights.set([
        { label: 'RFQ', value: rfq.length, toneClass: 'l1' },
        { label: 'PO', value: po.length, toneClass: 'l2' },
        { label: 'GR', value: gr.length, toneClass: 'l3' },
        { label: 'Finance', value: invoices.length, toneClass: 'l4' }
      ]);
    });
  }

  insightWidth(value: number): number {
    const max = this.maxInsightValue();
    if (!max || !value) {
      return 0;
    }
    return Math.max(18, Math.round((value / max) * 100));
  }

  trackByLabel(_: number, metric: InsightMetric): string {
    return metric.label;
  }
}
