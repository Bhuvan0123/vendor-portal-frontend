import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { GrService } from '../../../../core/services/gr.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { DetailPopupComponent } from '../../../../shared/components/detail-popup/detail-popup.component';

@Component({
  selector: 'app-gr-widget',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, BadgeComponent, DetailPopupComponent],
  template: `
    <section class="card" [style.animationDelay.ms]="240">
      <header>
        <h3>GR - Goods Receipts</h3>
        <app-badge [label]="'' + headers().length"></app-badge>
      </header>

      <div *ngIf="error()" class="error-banner">
        <span>Failed to load data. Please try again.</span>
        <button type="button" (click)="load()">Retry</button>
      </div>

      <div *ngIf="loading()" class="skeleton-list"><div class="skeleton row" *ngFor="let r of [1, 2, 3]"></div></div>
      <div *ngIf="!loading() && !headers().length" class="empty">No GRs found</div>

      <div class="table-wrap" *ngIf="!loading() && headers().length">

      <div class="table-controls">
        <input placeholder="Search" (input)="searchTerm.set($any($event.target).value.toLowerCase())" />
        <label>Page size:
          <select (change)="setPageSize($any($event.target).value)">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th (click)="toggleSort('materialdoc')">Material Doc <span *ngIf="sortKey() === 'materialdoc'">{{ sortDir() === 1 ? '▲' : '▼' }}</span></th>
            <th (click)="toggleSort('docyear')">Doc Year <span *ngIf="sortKey() === 'docyear'">{{ sortDir() === 1 ? '▲' : '▼' }}</span></th>
            <th (click)="toggleSort('postingdate')">Posting Date <span *ngIf="sortKey() === 'postingdate'">{{ sortDir() === 1 ? '▲' : '▼' }}</span></th>
            <th (click)="toggleSort('ponumber')">PO Number <span *ngIf="sortKey() === 'ponumber'">{{ sortDir() === 1 ? '▲' : '▼' }}</span></th>
            <th (click)="toggleSort('movementtype')">Movement Type <span *ngIf="sortKey() === 'movementtype'">{{ sortDir() === 1 ? '▲' : '▼' }}</span></th>
            <th (click)="toggleSort('plant')">Plant <span *ngIf="sortKey() === 'plant'">{{ sortDir() === 1 ? '▲' : '▼' }}</span></th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of visibleRows(); let i = index" [style.animationDelay.ms]="i * 30">
            <td>{{ row.materialdoc }}</td>
            <td>{{ row.docyear }}</td>
            <td>{{ row.postingdate | dateFormat }}</td>
            <td>{{ row.ponumber }}</td>
            <td>{{ row.movementtype }}</td>
            <td>{{ row.plant }}</td>
            <td class="action"><button class="eye" type="button" (click)="open(row)">👁</button></td>
          </tr>
        </tbody>
      </table>
      </div>
      <div class="pagination" *ngIf="processed().length > pageSize()">
        <button type="button" (click)="prevPage()" [disabled]="page() === 0">Prev</button>
        <span>Page {{ page() + 1 }} / {{ totalPages() }}</span>
        <button type="button" (click)="nextPage()" [disabled]="page() + 1 >= totalPages()">Next</button>
      </div>
    </section>

    <app-detail-popup
      *ngIf="selected()"
      [title]="'GR Items - ' + selected()?.materialdoc"
      [headerData]="selected()"
      [items]="items()"
      [loading]="itemsLoading()"
      (close)="closePopup()"
    ></app-detail-popup>
  `,
  styles: [
    `
      .card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 16px;
        animation: fadeInUp 0.4s ease both;
      }
      header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      h3 {
        margin: 0;
        color: var(--clr-700);
      }
      th,
      td {
        padding: 10px 12px;
        text-align: left;
        vertical-align: middle;
        white-space: nowrap;
      }
      th {
        color: var(--clr-600);
        font-size: 12px;
        border-bottom: 1px solid var(--clr-200);
      }

      .table-wrap {
        overflow-x: auto;
      }
      .action {
        text-align: center;
      }

      .eye {
        background: var(--clr-100);
        color: var(--clr-700);
        padding: 4px 10px;
      }
      .row {
        height: 30px;
        margin-bottom: 8px;
      }
      .empty {
        text-align: center;
        padding: 20px;
        color: var(--clr-500);
      }
      a {
        color: var(--clr-600);
        cursor: pointer;
      }
      .table-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        align-items: center;
        flex-wrap: wrap;
      }
      .table-controls input {
        flex: 1;
        min-width: 200px;
        padding: 8px 12px;
        border: 1px solid var(--clr-300);
        border-radius: var(--radius-sm);
        font-size: 14px;
      }
      .table-controls label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--clr-600);
        font-size: 14px;
      }
      .table-controls select {
        padding: 6px 10px;
        border: 1px solid var(--clr-300);
        border-radius: var(--radius-sm);
        font-size: 14px;
      }
      table {
        margin: 16px 0;
      }
      .pagination {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: center;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--clr-200);
      }
      .pagination button {
        padding: 8px 16px;
        border: 1px solid var(--clr-300);
        border-radius: var(--radius-sm);
        background: var(--clr-50);
        color: var(--clr-700);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      .pagination button:hover:not(:disabled) {
        background: var(--clr-200);
      }
      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .pagination span {
        color: var(--clr-600);
        font-size: 14px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GrWidgetComponent implements OnInit {
  readonly headers = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly expanded = signal(false);

  readonly searchTerm = signal('');
  readonly sortKey = signal('');
  readonly sortDir = signal(1);
  readonly page = signal(0);
  readonly pageSize = signal(5);

  readonly processed = computed(() => {
    const term = this.searchTerm().trim();
    let rows = this.headers();
    if (term) {
      rows = rows.filter((r: any) =>
        String(r.materialdoc).toLowerCase().includes(term) ||
        String(r.ponumber || '').toLowerCase().includes(term) ||
        String(r.movementtype || '').toLowerCase().includes(term) ||
        String(r.plant || '').toLowerCase().includes(term)
      );
    }
    const key = this.sortKey();
    if (key) {
      rows = [...rows].sort((a: any, b: any) => {
        const av = String(a[key] ?? '').toLowerCase();
        const bv = String(b[key] ?? '').toLowerCase();
        if (av < bv) return -1 * this.sortDir();
        if (av > bv) return 1 * this.sortDir();
        return 0;
      });
    }
    return rows;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.processed().length / this.pageSize())));

  readonly selected = signal<any | null>(null);
  readonly items = signal<any[]>([]);
  readonly itemsLoading = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly grService: GrService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  visibleRows(): any[] {
    const rows = this.processed();
    const start = this.page() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.grService.getHeaders(this.auth.getVendorId()).subscribe((rows) => {
      this.headers.set(rows);
      this.loading.set(false);
      this.error.set(!Array.isArray(rows));
    });
  }

  open(row: any): void {
    this.selected.set(row);
    this.itemsLoading.set(true);
    this.grService.getItems(String(row.materialdoc)).subscribe((items) => {
      this.items.set(items);
      this.itemsLoading.set(false);
    });
  }

  toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.set(-this.sortDir());
    } else {
      this.sortKey.set(key);
      this.sortDir.set(1);
    }
    this.page.set(0);
  }

  prevPage(): void {
    if (this.page() > 0) this.page.set(this.page() - 1);
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) this.page.set(this.page() + 1);
  }

  setPageSize(sz: string | number): void {
    const n = Number(sz);
    this.pageSize.set(Number.isFinite(n) && n > 0 ? n : 5);
    this.page.set(0);
  }

  closePopup(): void {
    this.selected.set(null);
    this.items.set([]);
  }
}
