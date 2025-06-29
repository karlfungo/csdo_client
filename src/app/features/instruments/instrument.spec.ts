import { TestBed } from '@angular/core/testing';

import { Instrument } from './instrument';

describe('Instrument', () => {
  let service: Instrument;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Instrument);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
