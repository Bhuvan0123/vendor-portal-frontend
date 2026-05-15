import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FinanceService } from '../../../core/services/finance.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { InvoicePopupComponent } from '../../../shared/components/invoice-popup/invoice-popup.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, DateFormatPipe, CurrencyInrPipe, BadgeComponent, InvoicePopupComponent],
  template: `
    <section class="page">
      <header>
        <h2>Invoices</h2>
        
      </header>

      <div class="filter">
        <input placeholder="Search invoice number" [(ngModel)]="search" (keyup.enter)="applySearch()" />
        <button type="button" (click)="applySearch()">Search</button>
        <button type="button" class="ghost-btn" (click)="clearSearch()">Clear</button>
      </div>

      <section class="analytics-card">
        <div class="analytics-head">
          <h3>Invoice Analytics</h3>
          <span>Based on filtered results</span>
        </div>

        <div class="kpi-grid">
          <article class="kpi">
            <p>Total Number of invoices</p>
            <h4>{{ filtered().length }}</h4>
          </article>
          <article class="kpi">
            <p>Total Amount</p>
            <h4>{{ totalAmount() | currencyInr }}</h4>
          </article>
          
        </div>
      </section>

      <div *ngIf="error()" class="error-banner">
        <span>Failed to load data. Please try again.</span>
        <button type="button" (click)="load()">Retry</button>
      </div>

      <div *ngIf="pdfError()" class="error-banner">
        <span>{{ pdfError() }}</span>
        <button type="button" (click)="pdfError.set('')">Dismiss</button>
      </div>

      <table *ngIf="!loading()">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Fiscal Year</th>
            <th>Invoice Date</th>
            <th>Posting Date</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of filtered(); let i = index" [style.animationDelay.ms]="i * 30" (click)="selected.set(row)">
            <td>{{ row.invoicenumber }}</td>
            <td>{{ row.fiscalyear }}</td>
            <td>{{ row.invoicedate | dateFormat }}</td>
            <td>{{ row.postingdate | dateFormat }}</td>
            <td>{{ row.amount | currencyInr }}</td>
            <td>{{ row.currency }}</td>
            <td>
              <button type="button" class="pdf-btn" (click)="downloadInvoicePdf(row, $event)">
                {{ downloadingKey() === (row.invoicenumber + '-' + row.fiscalyear) ? 'Downloading...' : 'Download PDF' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="loading()" class="skeleton" style="height: 220px"></div>
    </section>

    <app-invoice-popup *ngIf="selected()" [invoice]="selected()" (close)="selected.set(null)"></app-invoice-popup>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 12px;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      h2 {
        margin: 0;
        color: var(--clr-700);
      }
      .meta {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .amount {
        color: var(--clr-600);
        font-weight: 700;
      }
      .filter {
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 10px;
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .filter input {
        flex: 1;
      }

      .ghost-btn {
        background: var(--clr-100);
        color: var(--clr-700);
      }

      .analytics-card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 14px 16px;
      }

      .analytics-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }

      .analytics-head h3 {
        margin: 0;
        color: var(--clr-700);
        font-size: 14px;
      }

      .analytics-head span {
        color: var(--clr-500);
        font-size: 12px;
      }

      .kpi-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-top: 12px;
      }

      .kpi {
        background: var(--clr-50);
        border-left: 3px solid var(--clr-400);
        border-radius: var(--radius-md);
        padding: 10px 12px;
      }

      .kpi p {
        margin: 0;
        font-size: 12px;
        color: var(--clr-500);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .kpi h4 {
        margin: 6px 0 0;
        color: var(--clr-700);
        font-size: 22px;
      }

      @media (max-width: 900px) {
        .kpi-grid {
          grid-template-columns: 1fr;
        }
      }
      table {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
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

      .pdf-btn {
        padding: 6px 12px;
        white-space: nowrap;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicesComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly pdfError = signal('');
  readonly downloadingKey = signal('');
  readonly rows = signal<any[]>([]);
  readonly selected = signal<any | null>(null);
  readonly searchTerm = signal('');

  search = '';

  readonly filtered = computed(() => {
    const term = this.searchTerm();
    return this.rows().filter((row) => String(row.invoicenumber).toLowerCase().includes(term));
  });

  readonly activeMonths = computed(() => {
    const monthKeys = new Set<string>();
    for (const row of this.filtered()) {
      const rawDate = String(row.postingdate || row.invoicedate || '');
      if (rawDate.length === 8) {
        const year = Number(rawDate.substring(0, 4));
        const monthIndex = Number(rawDate.substring(4, 6)) - 1;
        if (Number.isFinite(year) && monthIndex >= 0 && monthIndex < 12) {
          monthKeys.add(`${year}-${String(monthIndex + 1).padStart(2, '0')}`);
        }
      }
    }
    return monthKeys.size;
  });

  readonly totalAmount = computed(() => this.filtered().reduce((acc, row) => acc + Number(row.amount || 0), 0));
  readonly averageAmount = computed(() => {
    const rows = this.filtered();
    if (!rows.length) {
      return 0;
    }
    return this.totalAmount() / rows.length;
  });
  readonly maxAmount = computed(() => this.filtered().reduce((max, row) => Math.max(max, Number(row.amount || 0)), 0));

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
    this.financeService.getInvoices(this.auth.getVendorId()).subscribe((rows) => {
      this.rows.set(rows);
      this.loading.set(false);
      this.error.set(!Array.isArray(rows));
      this.applySearch();
    });
  }

  applySearch(): void {
    this.searchTerm.set(this.search.trim().toLowerCase());
  }

  clearSearch(): void {
    this.search = '';
    this.searchTerm.set('');
  }

  downloadInvoicePdf(row: any, event: Event): void {
    event.stopPropagation();

    const invoiceNumber = String(row?.invoicenumber ?? '');
    const fiscalYear = String(row?.fiscalyear ?? '');
    const key = `${invoiceNumber}-${fiscalYear}`;
    this.pdfError.set('');
    this.downloadingKey.set(key);

    this.financeService.getInvoicePdf(invoiceNumber, fiscalYear).subscribe((blob) => {
      if (!blob || blob.size === 0) {
        this.pdfError.set('PDF not available for this invoice.');
        this.downloadingKey.set('');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}-${fiscalYear}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      this.downloadingKey.set('');
    });
  }
}
