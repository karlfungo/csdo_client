import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInstrument } from './add-instrument';

describe('AddInstrument', () => {
  let component: AddInstrument;
  let fixture: ComponentFixture<AddInstrument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInstrument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInstrument);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
