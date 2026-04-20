import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RfqService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly headerCache = new Map<string, Observable<any[]>>();
  private readonly itemCache = new Map<string, Observable<any[]>>();

  constructor(private readonly http: HttpClient) {}

  getHeaders(vendorId: string): Observable<any[]> {
    if (!this.headerCache.has(vendorId)) {
      this.headerCache.set(
        vendorId,
        this.http.get<any>(`${this.baseUrl}/api/rfq/${vendorId}`).pipe(
          map((response) => response?.data ?? []),
          catchError((error) => {
            console.warn('Failed to load RFQ headers', error);
            return of([]);
          }),
          shareReplay(1)
        )
      );
    }
    return this.headerCache.get(vendorId)!;
  }

  getItems(rfqNumber: string): Observable<any[]> {
    if (!this.itemCache.has(rfqNumber)) {
      this.itemCache.set(
        rfqNumber,
        this.http.get<any>(`${this.baseUrl}/api/rfq/${rfqNumber}/items`).pipe(
          map((response) => response?.data ?? []),
          catchError((error) => {
            console.warn('Failed to load RFQ items', error);
            return of([]);
          }),
          shareReplay(1)
        )
      );
    }
    return this.itemCache.get(rfqNumber)!;
  }

  clearCache(): void {
    this.headerCache.clear();
    this.itemCache.clear();
  }
}
