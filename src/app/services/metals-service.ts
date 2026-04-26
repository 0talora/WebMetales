import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetalsService {

  private http = inject(HttpClient);

  private url = 'https://www.gem-logic.com/es/api/live-gold-price/EUR/XAU';

  getMetal(symbol: string): Observable<any> {
    return this.http.get(
      `https://www.gem-logic.com/es/api/live-gold-price/EUR/${symbol}`
    );
  }
}