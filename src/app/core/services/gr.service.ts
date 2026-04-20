import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GrService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly headerCache = new Map<string, Observable<any[]>>();
  private readonly itemCache = new Map<string, Observable<any[]>>();

  constructor(private readonly http: HttpClient) {}

  getHeaders(vendorId: string): Observable<any[]> {
    if (!this.headerCache.has(vendorId)) {
      this.headerCache.set(
        vendorId,
        this.http.get<any>(`${this.baseUrl}/api/gr/${vendorId}`).pipe(
          map((response) => response?.data ?? []),
          catchError((error) => {
            console.warn('Failed to load GR headers', error);
            return of([]);
          }),
          shareReplay(1)
        )
      );
    }
    return this.headerCache.get(vendorId)!;
  }

  getItems(materialDoc: string): Observable<any[]> {
    if (!this.itemCache.has(materialDoc)) {
      this.itemCache.set(
        materialDoc,
        this.http.get<any>(`${this.baseUrl}/api/gr/${materialDoc}/items`).pipe(
          map((response) => response?.data ?? []),
          catchError((error) => {
            console.warn('Failed to load GR items', error);
            return of([]);
          }),
          shareReplay(1)
        )
      );
    }
    return this.itemCache.get(materialDoc)!;
  }

  clearCache(): void {
    this.headerCache.clear();
    this.itemCache.clear();
  }
}
