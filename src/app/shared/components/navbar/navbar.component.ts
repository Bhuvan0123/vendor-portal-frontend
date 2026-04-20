import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { VendorService } from '../../../core/services/vendor.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="brand">
        <span class="logo">V</span>
        <span>VendorConnect</span>
      </div>

      <button class="menu-btn" (click)="toggleDrawer()">☰</button>

      <nav class="nav-links" [class.open]="drawerOpen()">
        <a routerLink="/dashboard" routerLinkActive="active" (click)="drawerOpen.set(false)">Dashboard</a>
        <a routerLink="/finance" routerLinkActive="active" (click)="drawerOpen.set(false)">Finance</a>
        <a routerLink="/profile" routerLinkActive="active" (click)="drawerOpen.set(false)">Profile</a>
      </nav>

      <div class="right-actions">
        <div class="profile" (click)="toggleMenu()">
          <span class="avatar">{{ initial() }}</span>
          <span class="name">{{ vendorName() }}</span>
          <span>▾</span>
          <div class="dropdown" *ngIf="menuOpen()">
            <a routerLink="/profile" (click)="menuOpen.set(false)">My Profile</a>
          </div>
        </div>
        <button type="button" class="top-logout" (click)="logout($event)">Logout</button>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 64px;
        background: var(--clr-700);
        color: var(--white);
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 24px;
        padding: 0 24px;
        z-index: 100;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
      }

      .logo {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--clr-400);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .nav-links {
        justify-self: center;
        display: flex;
        gap: 8px;
      }

      .nav-links a {
        color: var(--white);
        text-decoration: none;
        padding: 8px 20px;
        border-radius: var(--radius-md);
        transition: all 0.2s ease;
      }

      .nav-links a:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .nav-links a.active {
        background: rgba(255, 255, 255, 0.15);
      }

      .profile {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .right-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--clr-400);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .dropdown {
        position: absolute;
        right: 0;
        top: 44px;
        min-width: 160px;
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        overflow: hidden;
      }

      .dropdown a,
      .dropdown .logout {
        display: block;
        width: 100%;
        text-align: left;
        padding: 10px 12px;
        color: var(--clr-700);
        background: var(--white);
        text-decoration: none;
        border-radius: 0;
      }

      .dropdown .logout:hover,
      .dropdown a:hover {
        background: var(--clr-50);
        box-shadow: none;
        transform: none;
      }

      .menu-btn {
        display: none;
      }

      .top-logout {
        background: var(--clr-500);
        color: var(--white);
        padding: 8px 14px;
      }

      @media (max-width: 767px) {
        .navbar {
          grid-template-columns: auto auto auto;
        }

        .menu-btn {
          display: inline-flex;
          justify-self: center;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .nav-links {
          position: fixed;
          top: 64px;
          left: 0;
          right: 35%;
          bottom: 0;
          background: var(--clr-700);
          flex-direction: column;
          padding: 18px;
          transform: translateX(-110%);
        }

        .nav-links.open {
          transform: translateX(0);
        }

        .name {
          display: none;
        }

        .top-logout {
          padding: 8px 10px;
          font-size: 12px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly vendorService = inject(VendorService);

  readonly menuOpen = signal(false);
  readonly drawerOpen = signal(false);
  readonly vendorName = signal('Vendor');
  readonly initial = computed(() => this.vendorName().charAt(0).toUpperCase() || 'V');

  constructor() {
    const vendorId = this.authService.getVendorId();
    this.vendorService.getProfile(vendorId).subscribe((profile) => {
      this.vendorName.set(profile?.name || 'Vendor');
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  toggleDrawer(): void {
    this.drawerOpen.set(!this.drawerOpen());
  }

  logout(event: Event): void {
    event.stopPropagation();
    this.authService.logout();
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
