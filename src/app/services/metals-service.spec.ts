import { TestBed } from '@angular/core/testing';

import { MetalsService } from './metals-service';

describe('MetalsService', () => {
  let service: MetalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
