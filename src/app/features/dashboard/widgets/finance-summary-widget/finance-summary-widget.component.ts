import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { FinanceService } from '../../../../core/services/finance.service';
import { CurrencyInrPipe } from '../../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-finance-summary-widget',
  standalone: true,
  imports: [CommonModule, CurrencyInrPipe],
  template: `
    <section class="card">
      <h3>Financial Overview</h3>
      <div class="tiles">
        <article class="tile">
          <p>Total Invoices</p>
          <h4>{{ animatedInvoiceCount() }}</h4>
        </article>
        <article class="tile">
          <p>Total Invoice Amount</p>
          <h4>{{ animatedInvoiceAmount() | currencyInr }}</h4>
        </article>
        <article class="tile">
          <p>Open Payments</p>
          <h4>{{ animatedOpenPayments() }}</h4>
        </article>
        <article class="tile">
          <p>Pending Amount</p>
          <h4>{{ animatedPendingAmount() | currencyInr }}</h4>
        </article>
      </div>
      <div class="status">
        <span>Quick Status</span>
        <div class="bar">
          <div class="paid" [style.width.%]="paidRatio()"></div>
          <div class="open" [style.width.%]="100 - paidRatio()"></div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 20px 28px;
        animation: fadeInUp 0.4s ease;
      }
      h3 {
        margin: 0 0 14px;
        color: var(--clr-700);
      }
      .tiles {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(4, 1fr);
      }
      .tile {
        background: var(--clr-50);
        border-radius: var(--radius-md);
        padding: 16px 20px;
        border-left: 3px solid var(--clr-400);
      }
      .tile p {
        margin: 0;
        color: var(--clr-500);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .tile h4 {
        margin: 4px 0 0;
        color: var(--clr-700);
        font-size: 28px;
      }
      .status {
        margin-top: 14px;
      }
      .status span {
        color: var(--clr-600);
        font-weight: 600;
      }
      .bar {
        margin-top: 8px;
        height: 12px;
        border-radius: 10px;
        overflow: hidden;
        background: var(--clr-200);
        display: flex;
      }
      .paid {
        background: var(--clr-400);
      }
      .open {
        background: var(--clr-200);
      }
      @media (max-width: 1024px) {
        .tiles {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 767px) {
        .tiles {
          grid-template-columns: 1fr;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceSummaryWidgetComponent implements OnInit {
  totalInvoices = signal(0);
  totalInvoiceAmount = signal(0);
  openPayments = signal(0);
  pendingAmount = signal(0);

  animatedInvoiceCount = signal(0);
  animatedInvoiceAmount = signal(0);
  animatedOpenPayments = signal(0);
  animatedPendingAmount = signal(0);
  paidRatio = signal(0);

  constructor(
    private readonly auth: AuthService,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit(): void {
    const vendorId = this.auth.getVendorId();
    this.financeService.getInvoices(vendorId).subscribe((invoices) => {
      const amount = invoices.reduce((acc, row) => acc + Number(row.amount || 0), 0);
      this.totalInvoices.set(invoices.length);
      this.totalInvoiceAmount.set(amount);
      this.animate(this.animatedInvoiceCount, invoices.length);
      this.animate(this.animatedInvoiceAmount, amount);
    });

    this.financeService.getPayments(vendorId).subscribe((payments) => {
      const open = payments.filter((p) => String(p.status).toUpperCase() === 'OPEN');
      const pending = open.reduce((acc, row) => acc + Number(row.amount || 0), 0);
      const paid = payments.filter((p) => String(p.status).toUpperCase() === 'PAID').length;
      this.openPayments.set(open.length);
      this.pendingAmount.set(pending);
      this.paidRatio.set(payments.length ? (paid / payments.length) * 100 : 0);
      this.animate(this.animatedOpenPayments, open.length);
      this.animate(this.animatedPendingAmount, pending);
    });
  }

  private animate(targetSignal: { set(v: number): void }, finalValue: number): void {
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      targetSignal.set(Math.round(finalValue * progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
