import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <section class="login-wrap" [class.success]="loginSuccess()">
      <aside class="hero-panel">
        <div class="floating c1"></div>
        <div class="floating c2"></div>
        <div class="floating c3"></div>
        <div class="floating c4"></div>
        <div class="hero-content">
          <svg viewBox="0 0 120 120" class="plant" aria-hidden="true">
            <path d="M62 18c-4 22-2 43 8 63" stroke="white" stroke-width="4" fill="none" />
            <path d="M66 40c18-12 29-20 34-34-20 5-34 14-42 29" fill="none" stroke="#74c69d" stroke-width="4" />
            <path d="M67 58c16 1 30-2 43-13-18-5-32-5-43 4" fill="none" stroke="#52b788" stroke-width="4" />
            <path d="M64 52c-14-18-27-28-47-30 9 20 25 29 46 33" fill="none" stroke="#95d5b2" stroke-width="4" />
          </svg>
          <h1>VendorConnect</h1>
          <p>Your procurement hub</p>
          <div class="pills">
            <span>📦 Real-time POs</span>
            <span>📄 Invoice Tracking</span>
            <span>📊 Financial Insights</span>
          </div>
        </div>
      </aside>

      <section class="form-panel">
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-card">
          <div class="logo-mark">V</div>
          <h2>Welcome back</h2>
          <p class="sub">Sign in to your vendor portal</p>

          <label for="vendorId">Vendor ID</label>
          <input id="vendorId" formControlName="vendorId" />

          <label for="password">Password</label>
          <div class="password-row">
            <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" />
            <button type="button" class="ghost" (click)="showPassword.set(!showPassword())">{{ showPassword() ? '🙈' : '👁' }}</button>
          </div>

          <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button type="submit" [disabled]="loading() || form.invalid" class="sign-btn">
            <ng-container *ngIf="!loading(); else loadingTpl">Sign In</ng-container>
          </button>
          <ng-template #loadingTpl>
            <app-loading-spinner label="Signing in..."></app-loading-spinner>
          </ng-template>
        </form>
      </section>
    </section>
  `,
  styles: [
    `
      .login-wrap {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 60% 40%;
      }

      .hero-panel {
        position: relative;
        overflow: hidden;
        background: linear-gradient(145deg, var(--clr-700), var(--clr-600));
        display: grid;
        place-items: center;
      }

      .hero-content {
        color: var(--white);
        text-align: center;
        max-width: 460px;
        z-index: 1;
        opacity: 0;
        transform: translateX(-20px);
        animation: inLeft 0.5s 0.2s forwards;
      }

      .plant {
        width: 120px;
        margin-bottom: 14px;
      }

      h1 {
        margin: 0;
        font-size: 32px;
      }

      .hero-content p {
        color: var(--clr-300);
        margin-top: 6px;
      }

      .pills {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }

      .pills span {
        background: rgba(255, 255, 255, 0.12);
        color: var(--white);
        border-radius: 20px;
        padding: 8px 16px;
      }

      .floating {
        position: absolute;
        border-radius: 50%;
        background: rgba(64, 145, 108, 0.12);
        animation: float 3s infinite alternate;
      }

      .c1 {
        width: 120px;
        height: 120px;
        left: 12%;
        top: 20%;
      }

      .c2 {
        width: 200px;
        height: 200px;
        right: 8%;
        top: 10%;
        animation-delay: 0.5s;
      }

      .c3 {
        width: 80px;
        height: 80px;
        left: 22%;
        bottom: 20%;
        animation-delay: 1s;
      }

      .c4 {
        width: 160px;
        height: 160px;
        right: 18%;
        bottom: 8%;
        animation-delay: 1.5s;
      }

      .form-panel {
        background: var(--white);
        display: grid;
        place-items: center;
      }

      .login-card {
        width: 100%;
        max-width: 360px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        opacity: 0;
        transform: translateX(20px);
        animation: inRight 0.5s 0.3s forwards;
      }

      .logo-mark {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        background: var(--clr-500);
        color: var(--white);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 700;
      }

      h2 {
        margin: 4px 0 0;
        color: var(--clr-700);
        font-size: 24px;
      }

      .sub {
        margin: 0 0 6px;
        color: var(--clr-400);
      }

      label {
        color: var(--clr-600);
        font-weight: 600;
      }

      .password-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
      }

      .ghost {
        padding: 0 12px;
        background: var(--clr-100);
        color: var(--clr-700);
      }

      .sign-btn {
        width: 100%;
        height: 48px;
      }

      .error {
        min-height: 20px;
        color: #842029;
        margin: 0;
      }

      .login-wrap.success {
        animation: fadeOut 0.3s ease forwards;
      }

      @keyframes inLeft {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes inRight {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes float {
        0% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
        100% {
          transform: translateY(0);
        }
      }

      @keyframes fadeOut {
        to {
          opacity: 0;
        }
      }

      @media (max-width: 767px) {
        .login-wrap {
          grid-template-columns: 1fr;
        }

        .hero-panel {
          display: none;
        }

        .form-panel {
          padding: 20px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly loginSuccess = signal(false);

  readonly form = this.fb.nonNullable.group({
    vendorId: ['6', [Validators.required]],
    password: ['', [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.errorMessage.set('');
    this.loading.set(true);
    const { vendorId, password } = this.form.getRawValue();

    this.authService
      .login(vendorId, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.loginSuccess.set(true);
          setTimeout(() => this.router.navigate(['/dashboard']), 280);
        },
        error: () => this.errorMessage.set('Invalid credentials. Please try again.')
      });
  }
}
