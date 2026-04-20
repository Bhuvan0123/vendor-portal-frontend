import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000';
  readonly isLoggedIn = signal<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(vendorId: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/login`, { vendorId, password }).pipe(
      tap(() => {
        localStorage.setItem('vendorId', vendorId || '6');
        this.isLoggedIn.set(true);
      }),
      catchError((error) => throwError(() => error))
    );
  }

  logout(): void {
    localStorage.clear();
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getVendorId(): string {
    return localStorage.getItem('vendorId') || '6';
  }
}
