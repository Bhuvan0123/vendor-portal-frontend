import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FinanceService } from '../../../core/services/finance.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, CurrencyInrPipe, BadgeComponent],
  template: `
    <section class="page">
      <div class="summary">
        <article><h4>{{ lt30 }}</h4><p>&lt; 30 days</p></article>
        <article class="mid"><h4>{{ bt30_60 }}</h4><p>30-60 days</p></article>
        <article class="high"><h4>{{ gt60 }}</h4><p>&gt; 60 days</p></article>
      </div>

      <section class="chart-card">
        <h3>Aging Distribution</h3>
        <div class="track-row">
          <span>&lt; 30 days</span>
          <div class="track"><div class="fill low" [style.width.%]="agingPct(lt30)"></div></div>
          <strong>{{ lt30 }}</strong>
        </div>
        <div class="track-row">
          <span>30-60 days</span>
          <div class="track"><div class="fill mid" [style.width.%]="agingPct(bt30_60)"></div></div>
          <strong>{{ bt30_60 }}</strong>
        </div>
        <div class="track-row">
          <span>&gt; 60 days</span>
          <div class="track"><div class="fill high" [style.width.%]="agingPct(gt60)"></div></div>
          <strong>{{ gt60 }}</strong>
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
            <th>Document Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Aging Days</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows(); let i = index" [style.animationDelay.ms]="i * 30">
            <td>{{ row.documentno }}</td>
            <td>{{ row.fiscalyear }}</td>
            <td>{{ row.documentdate | dateFormat }}</td>
            <td>{{ row.duedate | dateFormat }}</td>
            <td>{{ row.amount | currencyInr }}</td>
            <td>{{ row.currency }}</td>
            <td>
              <app-badge
                [label]="row.status"
                [bg]="statusStyle(row.status).bg"
                [color]="statusStyle(row.status).color"
                [border]="statusStyle(row.status).border"
              ></app-badge>
            </td>
            <td>
              <app-badge [label]="'' + calcAging(row)" [bg]="agingStyle(calcAging(row)).bg" [color]="agingStyle(calcAging(row)).color"></app-badge>
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
        background: var(--clr-100);
        border-radius: var(--radius-md);
        padding: 10px;
      }
      .summary .mid {
        background: #fff3cd;
      }
      .summary .high {
        background: #f8d7da;
      }

      .chart-card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 14px;
      }

      .chart-card h3 {
        margin: 0 0 8px;
        color: var(--clr-700);
        font-size: 14px;
      }

      .track-row {
        display: grid;
        grid-template-columns: 92px 1fr auto;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }

      .track-row span {
        color: var(--clr-600);
        font-size: 12px;
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

      .fill.low {
        background: var(--clr-400);
      }

      .fill.mid {
        background: #856404;
      }

      .fill.high {
        background: #842029;
      }
      h4,
      p {
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
export class PaymentsComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly rows = signal<any[]>([]);

  lt30 = 0;
  bt30_60 = 0;
  gt60 = 0;

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
    this.financeService.getPayments(this.auth.getVendorId()).subscribe((rows) => {
      this.rows.set(rows);
      this.loading.set(false);
      this.error.set(!Array.isArray(rows));
      this.lt30 = rows.filter((r) => this.calcAging(r) < 30).length;
      this.bt30_60 = rows.filter((r) => this.calcAging(r) >= 30 && this.calcAging(r) <= 60).length;
      this.gt60 = rows.filter((r) => this.calcAging(r) > 60).length;
    });
  }

  calcAging(row: any): number {
    const raw = String(row.duedate || '');
    if (raw.length !== 8) {
      return 0;
    }
    const due = new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`);
    return Math.max(Math.round((Date.now() - due.getTime()) / 86400000), 0);
  }

  statusStyle(status: string): { bg: string; color: string; border: string } {
    const key = String(status || '').toUpperCase();
    if (key === 'OPEN') {
      return { bg: 'var(--clr-100)', color: 'var(--clr-700)', border: '1px solid var(--clr-300)' };
    }
    if (key === 'PAID') {
      return { bg: '#e8f5e9', color: '#2e7d32', border: '1px solid transparent' };
    }
    return { bg: 'var(--clr-50)', color: 'var(--clr-700)', border: '1px solid var(--clr-200)' };
  }

  agingStyle(days: number): { bg: string; color: string } {
    if (days < 30) {
      return { bg: 'var(--clr-100)', color: 'var(--clr-700)' };
    }
    if (days <= 60) {
      return { bg: '#fff3cd', color: '#856404' };
    }
    return { bg: '#f8d7da', color: '#842029' };
  }

  agingPct(count: number): number {
    const total = this.lt30 + this.bt30_60 + this.gt60;
    return total ? (count / total) * 100 : 0;
  }
}
