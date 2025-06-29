import { TestBed } from '@angular/core/testing';

import { Sdgs } from './sdgs';

describe('Sdgs', () => {
  let service: Sdgs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sdgs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
