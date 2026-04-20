import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-shell" [class.authenticated]="isAuthenticated()">
      <app-navbar *ngIf="isAuthenticated()"></app-navbar>
      <main class="content" [class.with-nav]="isAuthenticated()" [@routeAnimations]="prepareRoute(outlet)">
        <router-outlet #outlet="outlet"></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      :host,
      .app-shell {
        display: block;
        min-height: 100vh;
      }

      .content {
        min-height: 100vh;
      }

      .content.with-nav {
        margin-top: 64px;
        padding: 24px;
        background: var(--surface);
      }
    `
  ],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' }), animate('0.25s ease', style({ opacity: 1, transform: 'translateY(0)' }))], {
          optional: true
        }),
        query(':leave', [style({ opacity: 1 }), animate('0.15s ease', style({ opacity: 0 }))], { optional: true })
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? this.router.url;
  }
}
