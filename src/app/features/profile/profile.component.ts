import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { VendorService } from '../../core/services/vendor.service';
import { RfqService } from '../../core/services/rfq.service';
import { PoService } from '../../core/services/po.service';
import { GrService } from '../../core/services/gr.service';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile-grid">
      <article class="profile-card">
        <div class="avatar">{{ initial() }}</div>
        <h2>{{ profile().name || 'Vendor' }}</h2>
        <p class="id">{{ profile().vendorid || vendorId }}</p>
        <span class="pill">{{ profile().companycode || '-' }}</span>
        <hr />

        <div class="row"><label>Address</label><span>{{ profile().street || '-' }}</span></div>
        <div class="row"><label>City</label><span>{{ profile().city || '-' }}</span></div>
        <div class="row"><label>Country</label><span>{{ profile().country || '-' }}</span></div>
        <div class="row"><label>Postal Code</label><span>{{ profile().postalcode || '-' }}</span></div>
        <div class="row"><label>Region</label><span>{{ profile().region || '-' }}</span></div>
        <div class="row"><label>Phone</label><span>{{ profile().phone || '-' }}</span></div>
        <div class="row"><label>Recon Account</label><span>{{ profile().reconaccount || '-' }}</span></div>
      </article>

      <article class="stats-card">
        <h3>Activity Summary</h3>
        <div class="stats-grid">
          <div><strong>{{ rfqCount() }}</strong><span>Total RFQs</span></div>
          <div><strong>{{ poCount() }}</strong><span>Total POs</span></div>
          <div><strong>{{ grCount() }}</strong><span>Total GRs</span></div>
          <div><strong>{{ invCount() }}</strong><span>Total Invoices</span></div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .profile-grid {
        display: grid;
        grid-template-columns: 60% 40%;
        gap: 18px;
      }
      .profile-card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 20px;
      }
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--clr-600);
        color: var(--white);
        font-size: 36px;
        font-weight: 700;
        display: grid;
        place-items: center;
      }
      h2 {
        margin: 12px 0 0;
        color: var(--clr-700);
      }
      .id {
        color: var(--clr-400);
        font-family: monospace;
      }
      .pill {
        background: var(--clr-100);
        color: var(--clr-700);
        padding: 4px 12px;
        border-radius: 18px;
      }
      .row {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 12px;
        margin-top: 10px;
      }
      label {
        color: var(--clr-400);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .row span {
        color: var(--clr-700);
      }
      .stats-card {
        background: linear-gradient(135deg, var(--clr-700), var(--clr-600));
        color: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 20px;
      }
      .stats-grid {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .stats-grid div {
        background: rgba(255, 255, 255, 0.12);
        border-radius: var(--radius-md);
        padding: 12px;
      }
      strong {
        font-size: 24px;
        display: block;
      }
      @media (max-width: 767px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  readonly profile = signal<any>({});
  readonly rfqCount = signal(0);
  readonly poCount = signal(0);
  readonly grCount = signal(0);
  readonly invCount = signal(0);

  readonly initial = computed(() => String(this.profile().name || 'V').charAt(0).toUpperCase());

  vendorId = '6';

  constructor(
    private readonly auth: AuthService,
    private readonly vendorService: VendorService,
    private readonly rfqService: RfqService,
    private readonly poService: PoService,
    private readonly grService: GrService,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.vendorId = this.auth.getVendorId();
    this.vendorService.getProfile(this.vendorId).subscribe((profile) => this.profile.set(profile));
    this.rfqService.getHeaders(this.vendorId).subscribe((rows) => this.rfqCount.set(rows.length));
    this.poService.getHeaders(this.vendorId).subscribe((rows) => this.poCount.set(rows.length));
    this.grService.getHeaders(this.vendorId).subscribe((rows) => this.grCount.set(rows.length));
    this.financeService.getInvoices(this.vendorId).subscribe((rows) => this.invCount.set(rows.length));
  }
}
