import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { catchError, firstValueFrom, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { VendorService } from './core/services/vendor.service';

function preloadProfileFactory(auth: AuthService, vendor: VendorService) {
  return () => {
    if (!auth.isAuthenticated()) {
      return Promise.resolve();
    }
    return firstValueFrom(vendor.getProfile(auth.getVendorId()).pipe(catchError(() => of(null)))).then(() => void 0);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: preloadProfileFactory,
      deps: [AuthService, VendorService]
    }
  ]
};
