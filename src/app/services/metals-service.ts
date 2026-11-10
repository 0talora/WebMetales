import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';

export const metals = ['XAU', 'XAG', 'XPT', 'XPD'] as const;
export type Metal = typeof metals[number];
export const gramsPerUnit = { g: 1, oz: 31.1034768, kg: 1000, lb: 453.59237 };

export interface Quote {
  eurosPerOunce: number;
  updatedAt: string;
  exchangeDate: string;
}

@Injectable({ providedIn: 'root' })
export class MetalsService {
  private readonly http = inject(HttpClient);

  getQuote(metal: Metal) {
    return forkJoin({
      spot: this.http.get<{ price: number; currency: string; updatedAt: string }>(
        'https://api.gold-api.com/price/' + metal, { timeout: 8000 }
      ),
      exchange: this.http.get<{ rate: number; date: string }>(
        'https://api.frankfurter.dev/v2/rate/USD/EUR', { timeout: 8000 }
      )
    }).pipe(map(({ spot, exchange }): Quote => {
      const eurosPerOunce = spot.price * exchange.rate;
      if (spot.currency !== 'USD' || !Number.isFinite(eurosPerOunce) || eurosPerOunce <= 0 ||
          !Number.isFinite(Date.parse(spot.updatedAt)) || !/^\d{4}-\d{2}-\d{2}$/.test(exchange.date) ||
          !Number.isFinite(Date.parse(exchange.date))) {
        throw new Error('Invalid quote response');
      }
      return { eurosPerOunce, updatedAt: spot.updatedAt, exchangeDate: exchange.date };
    }));
  }
}
