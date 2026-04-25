import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="panel" (click)="$event.stopPropagation()">
        <header class="head">
          <div class="head-top">
            <div class="title-wrap">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M7 3h7l5 5v13H7z" />
                <path d="M14 3v5h5" />
              </svg>
              <h3>{{ title }}</h3>
            </div>
            <button type="button" class="close-btn" (click)="close.emit()">✕</button>
          </div>
          <div class="chips">
            <span class="chip" *ngFor="let pair of headerPairs">{{ pair.key }}: {{ pair.value }}</span>
          </div>
        </header>

        <section class="body" *ngIf="showItems">
          <div class="divider"><span>Items</span></div>

          <div *ngIf="loading" class="loading-rows">
            <div class="skeleton row" *ngFor="let r of [1, 2, 3]"></div>
          </div>

          <div *ngIf="!loading && !items.length" class="empty">No items found</div>

          <div class="table-wrap" *ngIf="!loading && items.length">
            <table>
              <thead>
                <tr>
                  <th *ngFor="let col of itemColumns">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items; let i = index" [style.animationDelay.ms]="i * 30">
                  <td *ngFor="let col of itemColumns">{{ item[col] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
        z-index: 200;
      }

      .panel {
        width: min(760px, 100%);
        max-height: 85vh;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        animation: popupIn 0.2s ease;
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

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      h3 {
        margin: 0;
        font-size: 18px;
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
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chip {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 12px;
      }

      .body {
        padding: 18px 22px 24px;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
      }

      .divider {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--clr-600);
        margin-bottom: 12px;
      }

      .divider::after {
        content: '';
        flex: 1;
        border-top: 1px solid var(--clr-200);
      }

      .divider span {
        font-weight: 600;
      }

      th {
        background: var(--clr-700);
        color: var(--white);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 9px 12px;
        text-align: left;
      }

      td {
        padding: 10px 12px;
        color: var(--clr-800);
        font-size: 13px;
      }

      tbody tr:nth-child(even) {
        background: var(--clr-50);
      }

      .empty {
        text-align: center;
        color: var(--clr-500);
        padding: 28px;
      }

      .row {
        height: 36px;
        margin-bottom: 8px;
      }

      @keyframes popupIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailPopupComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title = '';
  @Input() headerData: any = {};
  @Input() items: any[] = [];
  @Input() loading = false;
  @Input() showItems = true;
  @Output() close = new EventEmitter<void>();

  headerPairs: Array<{ key: string; value: any }> = [];
  itemColumns: string[] = [];

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.refresh();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['headerData'] || changes['items']) {
      this.refresh();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close.emit();
  }

  private refresh(): void {
    this.headerPairs = Object.entries(this.headerData || {})
      .filter(([key]) => key !== '__metadata')
      .map(([key, value]) => ({ key, value }));
    this.itemColumns = this.items.length ? Object.keys(this.items[0]).filter((key) => key !== '__metadata') : [];
  }
}
