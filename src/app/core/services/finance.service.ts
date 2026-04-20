import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly cache = new Map<string, Observable<any>>();

  constructor(private readonly http: HttpClient) {}

  getInvoices(vendorId: string): Observable<any[]> {
    return this.cached(`invoices-${vendorId}`, `${this.baseUrl}/api/finance/invoices/${vendorId}`);
  }

  getInvoiceItems(invoiceNumber: string, fiscalYear: string): Observable<any[]> {
    return this.cached(
      `invoice-items-${invoiceNumber}-${fiscalYear}`,
      `${this.baseUrl}/api/finance/invoices/${invoiceNumber}/${fiscalYear}/items`
    );
  }

  getPayments(vendorId: string): Observable<any[]> {
    return this.cached(`payments-${vendorId}`, `${this.baseUrl}/api/finance/payments/${vendorId}`);
  }

  getMemos(vendorId: string): Observable<any[]> {
    return this.cached(`memo-${vendorId}`, `${this.baseUrl}/api/finance/memo/${vendorId}`);
  }

  getInvoicePdf(invoiceNumber: string, fiscalYear: string): Observable<Blob> {
    const key = `invoice-pdf-${invoiceNumber}-${fiscalYear}`;
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        this.http
          .get(`${this.baseUrl}/api/pdf/invoice?invoicenumber=${invoiceNumber}&fiscalyear=${fiscalYear}`, {
            responseType: 'blob'
          })
          .pipe(
            map((response) => response as Blob),
            catchError((error) => {
              console.warn('Failed to load invoice PDF', error);
              return of(new Blob());
            }),
            shareReplay(1)
          )
      );
    }
    return this.cache.get(key) as Observable<Blob>;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private cached(key: string, url: string): Observable<any[]> {
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        this.http.get<any>(url).pipe(
          map((response) => response?.data ?? []),
          catchError((error) => {
            console.warn('Finance service fallback', error);
            return of([]);
          }),
          shareReplay(1)
        )
      );
    }
    return this.cache.get(key) as Observable<any[]>;
  }
}
