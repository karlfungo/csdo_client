import { TestBed } from '@angular/core/testing';

import { AnnualReport } from './annual-report';

describe('AnnualReport', () => {
  let service: AnnualReport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnualReport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
