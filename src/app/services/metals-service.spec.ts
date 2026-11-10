import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MetalsService } from './metals-service';

describe('MetalsService', () => {
  it('converts the USD quote per troy ounce into euros', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(MetalsService);
    const http = TestBed.inject(HttpTestingController);
    const quote = firstValueFrom(service.getQuote('XPT'));

    http.expectOne('https://api.gold-api.com/price/XPT').flush({
      price: 1000, currency: 'USD', updatedAt: '2026-11-10T10:00:00Z'
    });
    http.expectOne('https://api.frankfurter.dev/v2/rate/USD/EUR').flush({
      rate: 0.9, date: '2026-11-10'
    });

    expect(await quote).toEqual({
      eurosPerOunce: 900, updatedAt: '2026-11-10T10:00:00Z', exchangeDate: '2026-11-10'
    });
    http.verify();
  });
});
