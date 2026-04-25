import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { PoService } from '../../../../core/services/po.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { DetailPopupComponent } from '../../../../shared/components/detail-popup/detail-popup.component';

@Component({
  selector: 'app-po-widget',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, BadgeComponent, DetailPopupComponent],
  template: `
    <section class="card" [style.animationDelay.ms]="160">
      <header>
        <h3>PO - Purchase Orders</h3>
        <app-badge [label]="'' + headers().length"></app-badge>
      </header>

      <div *ngIf="error()" class="error-banner">
        <span>Failed to load data. Please try again.</span>
        <button type="button" (click)="load()">Retry</button>
      </div>

      <div *ngIf="loading()" class="skeleton-list"><div class="skeleton row" *ngFor="let r of [1, 2, 3]"></div></div>
      <div *ngIf="!loading() && !headers().length" class="empty">No POs found</div>

      <div class="table-wrap" *ngIf="!loading() && headers().length">
      <table>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Doc Type</th>
            <th>Currency</th>
            <th>Purchase Org</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of visibleRows(); let i = index" [style.animationDelay.ms]="i * 30">
            <td>{{ row.ponumber }}</td>
            <td>{{ row.doctype }}</td>
            <td>{{ row.currency }}</td>
            <td>{{ row.purchorg }}</td>
            <td>{{ row.createddate | dateFormat }}</td>
            <td class="action"><button class="eye" type="button" (click)="open(row)">👁</button></td>
          </tr>
        </tbody>
      </table>
      </div>
      <a *ngIf="headers().length > 5" (click)="expanded.set(!expanded())">{{ expanded() ? 'Show Less' : 'View All' }}</a>
    </section>

    <app-detail-popup
      *ngIf="selected()"
      [title]="'PO Items - ' + selected()?.ponumber"
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
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoWidgetComponent implements OnInit {
  readonly headers = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly expanded = signal(false);

  readonly selected = signal<any | null>(null);
  readonly items = signal<any[]>([]);
  readonly itemsLoading = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly poService: PoService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  visibleRows(): any[] {
    return this.expanded() ? this.headers() : this.headers().slice(0, 5);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.poService.getHeaders(this.auth.getVendorId()).subscribe((rows) => {
      this.headers.set(rows);
      this.loading.set(false);
      this.error.set(!Array.isArray(rows));
    });
  }

  open(row: any): void {
    this.selected.set(row);
    this.itemsLoading.set(true);
    this.poService.getItems(String(row.ponumber)).subscribe((items) => {
      this.items.set(items);
      this.itemsLoading.set(false);
    });
  }

  closePopup(): void {
    this.selected.set(null);
    this.items.set([]);
  }
}
