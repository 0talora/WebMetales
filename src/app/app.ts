import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { languages, Preferences } from './preferences';
import { gramsPerUnit, Metal, metals, MetalsService, Quote } from './services/metals-service';

type QuoteState = { status: 'loading' | 'error' } | { status: 'ready'; quote: Quote };

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private readonly service = inject(MetalsService);
  private readonly requestedMetal = new BehaviorSubject<Metal>('XAU');
  readonly preferences = inject(Preferences);
  readonly languageOptions = Object.entries(languages);
  readonly metals = metals;
  readonly gramsPerOunce = gramsPerUnit.oz;
  readonly units = Object.keys(gramsPerUnit) as (keyof typeof gramsPerUnit)[];
  readonly purities = [24, 22, 20, 18, 16, 14, 12, 10];
  readonly metal = signal<Metal>('XAU');
  readonly unit = signal<keyof typeof gramsPerUnit>('g');
  readonly amount = signal<number | null>(1);
  readonly purity = signal(24);
  readonly state = toSignal(this.requestedMetal.pipe(
    switchMap(metal => this.service.getQuote(metal).pipe(
      map((quote): QuoteState => ({ status: 'ready', quote })),
      catchError(() => of<QuoteState>({ status: 'error' })),
      startWith<QuoteState>({ status: 'loading' })
    ))
  ), { requireSync: true });

  readonly quote = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.quote : null;
  });

  readonly estimate = computed(() => {
    const quote = this.quote();
    const amount = this.amount();
    if (!quote || amount === null || !Number.isFinite(amount) || amount <= 0) return null;

    const purity = this.metal() === 'XAU' ? this.purity() / 24 : 1;
    const total = quote.eurosPerOunce / gramsPerUnit.oz * gramsPerUnit[this.unit()] * amount * purity;
    return Number.isFinite(total) ? total : null;
  });

  readonly currency = computed(() => new Intl.NumberFormat(this.preferences.language(), {
    style: 'currency', currency: 'EUR'
  }));

  readonly timestamp = computed(() => new Intl.DateTimeFormat(this.preferences.language(), {
    dateStyle: 'medium', timeStyle: 'short'
  }));

  readonly date = computed(() => new Intl.DateTimeFormat(this.preferences.language(), {
    dateStyle: 'medium', timeZone: 'UTC'
  }));

  formatDate(value: string, formatter: Intl.DateTimeFormat): string {
    return formatter.format(Date.parse(value));
  }

  selectMetal(metal: Metal): void {
    this.metal.set(metal);
    this.refresh();
  }

  refresh(): void {
    this.requestedMetal.next(this.metal());
  }
}
