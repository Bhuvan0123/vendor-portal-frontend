import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrap">
      <div class="spinner"></div>
      <p *ngIf="label">{{ label }}</p>
    </div>
  `,
  styles: [
    `
      .spinner-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--clr-600);
      }

      .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid var(--clr-200);
        border-top-color: var(--clr-500);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  @Input() label = '';
}
