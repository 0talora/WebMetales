import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AppComponent } from './app';
import { gramsPerUnit, MetalsService, Quote } from './services/metals-service';

const sample: Quote = {
  eurosPerOunce: gramsPerUnit.oz * 100,
  updatedAt: '2026-11-10T10:00:00Z',
  exchangeDate: '2026-11-10'
};

describe('AppComponent', () => {
  it('calculates the estimate from the selected unit, quantity and gold purity', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: MetalsService, useValue: { getQuote: () => of(sample) } }]
    });

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toBeTruthy();
    expect(app.estimate()).toBeCloseTo(100);
    app.amount.set(2.5);
    app.unit.set('kg');
    app.purity.set(18);
    expect(app.estimate()).toBeCloseTo(187500);
    app.selectMetal('XAG');
    expect(app.estimate()).toBeCloseTo(250000);
    app.amount.set(null);
    expect(app.estimate()).toBeNull();
  });

  it('discards a stale quote and allows retrying a failed request', () => {
    const gold = new Subject<Quote>();
    const silver = new Subject<Quote>();
    let silverRequests = 0;
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{
        provide: MetalsService,
        useValue: {
          getQuote: (metal: string) => metal === 'XAU' ? gold : ++silverRequests === 1 ? silver : of(sample)
        }
      }]
    });

    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.selectMetal('XAG');
    gold.next(sample);
    expect(app.state().status).toBe('loading');
    silver.error(new Error('offline'));
    expect(app.state().status).toBe('error');
    app.refresh();
    expect(app.estimate()).toBeCloseTo(100);
  });
});
