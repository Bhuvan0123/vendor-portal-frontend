import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FinanceService } from '../../../core/services/finance.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-memo',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, CurrencyInrPipe, BadgeComponent],
  template: `
    <section class="page">
      <div class="summary">
        <article><p>Total DEBIT</p><h4>{{ totalDebit() | currencyInr }}</h4></article>
        <article><p>Total CREDIT</p><h4>{{ totalCredit() | currencyInr }}</h4></article>
        <article [class.negative]="net() < 0"><p>Net Position</p><h4>{{ net() | currencyInr }}</h4></article>
      </div>

      <div class="filters">
        <button type="button" [class.active]="activeType() === 'ALL'" (click)="activeType.set('ALL')">All</button>
        <button type="button" [class.active]="activeType() === 'CREDIT'" (click)="activeType.set('CREDIT')">Credit</button>
        <button type="button" [class.active]="activeType() === 'DEBIT'" (click)="activeType.set('DEBIT')">Debit</button>
      </div>

      <section class="chart-card">
        <h3>Debit vs Credit</h3>
        <div class="pair-bars">
          <div class="bar-row">
            <span>Credit</span>
            <div class="track"><div class="fill credit" [style.width.%]="amountPct(totalCredit())"></div></div>
          </div>
          <div class="bar-row">
            <span>Debit</span>
            <div class="track"><div class="fill debit" [style.width.%]="amountPct(totalDebit())"></div></div>
          </div>
        </div>
      </section>

      <div *ngIf="error()" class="error-banner">
        <span>Failed to load data. Please try again.</span>
        <button type="button" (click)="load()">Retry</button>
      </div>

      <table *ngIf="!loading()">
        <thead>
          <tr>
            <th>Document No</th>
            <th>Fiscal Year</th>
            <th>Company Code</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Posting Date</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of filteredRows(); let i = index" [style.animationDelay.ms]="i * 30">
            <td>{{ row.documentno }}</td>
            <td>{{ row.fiscalyear }}</td>
            <td>{{ row.companycode }}</td>
            <td>{{ row.amount | currencyInr }}</td>
            <td>{{ row.currency }}</td>
            <td>{{ row.postingdate | dateFormat }}</td>
            <td>
              <app-badge [label]="row.type" [bg]="typeStyle(row.type).bg" [color]="typeStyle(row.type).color"></app-badge>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="loading()" class="skeleton" style="height: 220px"></div>
    </section>

  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 12px;
      }
      .summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .summary article {
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 10px 14px;
      }
      .summary article.negative {
        background: #f8d7da;
        color: #842029;
      }

      .filters {
        display: flex;
        gap: 8px;
      }

      .filters button {
        background: var(--clr-100);
        color: var(--clr-700);
      }

      .filters button.active {
        background: var(--clr-500);
        color: var(--white);
      }

      .chart-card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 14px;
      }

      .chart-card h3 {
        margin: 0 0 10px;
        color: var(--clr-700);
        font-size: 14px;
      }

      .pair-bars {
        display: grid;
        gap: 8px;
      }

      .bar-row {
        display: grid;
        grid-template-columns: 60px 1fr;
        gap: 10px;
        align-items: center;
      }

      .track {
        height: 10px;
        border-radius: 8px;
        background: var(--clr-50);
        overflow: hidden;
      }

      .fill {
        height: 100%;
      }

      .fill.credit {
        background: var(--clr-500);
      }

      .fill.debit {
        background: #842029;
      }
      .summary p,
      .summary h4 {
        margin: 0;
      }
      table {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }
      th,
      td {
        padding: 10px;
        text-align: left;
      }
      th {
        font-size: 12px;
        color: var(--clr-600);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemoComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly rows = signal<any[]>([]);
  readonly activeType = signal<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  readonly totalDebit = computed(() =>
    this.rows()
      .filter((r) => String(r.type).toUpperCase() === 'DEBIT')
      .reduce((acc, r) => acc + Number(r.amount || 0), 0)
  );

  readonly totalCredit = computed(() =>
    this.rows()
      .filter((r) => String(r.type).toUpperCase() === 'CREDIT')
      .reduce((acc, r) => acc + Number(r.amount || 0), 0)
  );

  readonly net = computed(() => this.totalCredit() - this.totalDebit());

  readonly filteredRows = computed(() => {
    const type = this.activeType();
    if (type === 'ALL') {
      return this.rows();
    }
    return this.rows().filter((r) => String(r.type).toUpperCase() === type);
  });

  constructor(
    private readonly auth: AuthService,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.financeService.getMemos(this.auth.getVendorId()).subscribe((rows) => {
      this.rows.set(rows);
      this.loading.set(false);
      this.error.set(!Array.isArray(rows));
    });
  }

  typeStyle(type: string): { bg: string; color: string } {
    return String(type).toUpperCase() === 'DEBIT'
      ? { bg: '#f8d7da', color: '#842029' }
      : { bg: 'var(--clr-100)', color: 'var(--clr-700)' };
  }

  amountPct(amount: number): number {
    const max = Math.max(this.totalCredit(), this.totalDebit(), 1);
    return (amount / max) * 100;
  }
}
