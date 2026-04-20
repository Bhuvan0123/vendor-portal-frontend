import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly profileSubject = new BehaviorSubject<any>(null);
  readonly profile$ = this.profileSubject.asObservable();
  private profileCache = new Map<string, Observable<any>>();

  constructor(private readonly http: HttpClient) {}

  getProfile(vendorId: string): Observable<any> {
    if (!this.profileCache.has(vendorId)) {
      const request$ = this.http.get<any>(`${this.baseUrl}/api/vendor/${vendorId}`).pipe(
        map((res) => res?.data ?? {}),
        tap((profile) => this.profileSubject.next(profile)),
        catchError((error) => {
          console.warn('Failed to load vendor profile', error);
          const fallback = {};
          this.profileSubject.next(fallback);
          return of(fallback);
        }),
        shareReplay(1)
      );
      this.profileCache.set(vendorId, request$);
    }
    return this.profileCache.get(vendorId)!;
  }

  resetCache(): void {
    this.profileCache.clear();
    this.profileSubject.next(null);
  }
}
