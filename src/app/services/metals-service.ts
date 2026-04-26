import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MetalsService {

  private http = inject(HttpClient);

  private apiKey =
    'xl0N6qcc6ZSbks2yAy07OeUAh3OsaydPiAscs0VmJJw7KgtQd4udLG8nwx2x%20';

  getMetals() {
    return this.http.get<any>(
      `https://freegoldprice.org/api/v2?key=${this.apiKey}&action=GSPPJM`
    );
  }
}