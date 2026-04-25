import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../../core/services/finance.service';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-invoice-popup',
  standalone: true,
  imports: [CommonModule, SafeResourceUrlPipe, LoadingSpinnerComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="panel" (click)="$event.stopPropagation()">
        <header class="head">
          <div class="head-top">
            <h3>Invoice {{ invoice?.invoicenumber }} / {{ invoice?.fiscalyear }}</h3>
            <button type="button" class="close-btn" (click)="close.emit()">✕</button>
          </div>
          <div class="chips">
            <span class="chip" *ngFor="let pair of headerPairs">{{ pair.key }}: {{ pair.value }}</span>
          </div>
        </header>

        <section class="body">
          <div class="divider"><span>Items</span></div>
          <div *ngIf="loadingItems" class="skeleton row" style="height: 90px"></div>
          <div class="table-wrap" *ngIf="!loadingItems && items.length">
            <table>
              <thead>
                <tr>
                  <th *ngFor="let c of itemColumns">{{ c }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items">
                  <td *ngFor="let c of itemColumns">{{ item[c] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="!loadingItems && !items.length" class="empty">No items found</div>

          <div class="divider"><span>Document Preview</span></div>
          <div *ngIf="loadingPdf" class="pdf-loading"><app-loading-spinner label="Loading document..."></app-loading-spinner></div>
          <div *ngIf="!loadingPdf && pdfError" class="pdf-error">PDF not available</div>
          <iframe *ngIf="!loadingPdf && !pdfError && pdfBlobUrl" [src]="pdfBlobUrl | safeResourceUrl" width="100%" height="400"></iframe>
          <button type="button" *ngIf="!loadingPdf && !pdfError && pdfBlob" (click)="downloadPdf()">📄 Download PDF</button>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(8, 28, 21, 0.55);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        padding: 20px;
        z-index: 220;
      }
      .panel {
        width: min(860px, 100%);
        max-height: 85vh;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
      }
      .head {
        background: linear-gradient(135deg, var(--clr-700), var(--clr-600));
        color: var(--white);
        padding: 24px 28px;
      }

      .head-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      h3 {
        margin: 0;
      }
      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .chips {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        background: rgba(255, 255, 255, 0.12);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
      }
      .body {
        padding: 20px;
      }
      .divider {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
        color: var(--clr-600);
      }
      .divider::after {
        content: '';
        flex: 1;
        border-top: 1px solid var(--clr-200);
      }

      .table-wrap {
        overflow-x: auto;
        margin-bottom: 10px;
      }

      table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
      }
      th {
        background: var(--clr-700);
        color: var(--white);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 12px;
        padding: 8px 10px;
      }
      td {
        padding: 8px 10px;
      }
      tbody tr:nth-child(even) {
        background: var(--clr-50);
      }
      iframe {
        border: 1px solid var(--clr-200);
        border-radius: var(--radius-md);
      }
      .empty,
      .pdf-error,
      .pdf-loading {
        border: 1px dashed var(--clr-200);
        border-radius: var(--radius-md);
        padding: 20px;
        text-align: center;
        color: var(--clr-500);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicePopupComponent implements OnInit, OnChanges, OnDestroy {
  @Input() invoice: any;
  @Output() close = new EventEmitter<void>();

  headerPairs: Array<{ key: string; value: any }> = [];
  items: any[] = [];
  itemColumns: string[] = [];
  loadingItems = true;
  loadingPdf = true;
  pdfError = false;
  pdfBlobUrl = '';
  pdfBlob: Blob | null = null;

  constructor(private readonly financeService: FinanceService) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice'] && !changes['invoice'].firstChange) {
      this.fetchData();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close.emit();
  }

  downloadPdf(): void {
    if (!this.pdfBlob || this.pdfBlob.size === 0) {
      this.pdfError = true;
      return;
    }

    const url = URL.createObjectURL(this.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${this.invoice?.invoicenumber}-${this.invoice?.fiscalyear}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private fetchData(): void {
    if (!this.invoice) {
      return;
    }

    this.headerPairs = Object.entries(this.invoice)
      .filter(([k]) => k !== '__metadata')
      .map(([key, value]) => ({ key, value }));

    this.loadingItems = true;
    this.financeService.getInvoiceItems(String(this.invoice.invoicenumber), String(this.invoice.fiscalyear)).subscribe((items) => {
      this.items = items;
      this.itemColumns = items.length ? Object.keys(items[0]).filter((k) => k !== '__metadata') : [];
      this.loadingItems = false;
    });

    this.loadingPdf = true;
    this.pdfError = false;
    this.financeService.getInvoicePdf(String(this.invoice.invoicenumber), String(this.invoice.fiscalyear)).subscribe((blob) => {
      this.pdfBlob = blob;
      if (!blob || blob.size === 0) {
        this.pdfError = true;
        this.loadingPdf = false;
        return;
      }

      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
      }

      this.pdfBlobUrl = URL.createObjectURL(blob);
      this.loadingPdf = false;
    });
  }
}
