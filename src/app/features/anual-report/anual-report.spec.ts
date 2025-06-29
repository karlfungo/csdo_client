import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnualReport } from './anual-report';

describe('AnualReport', () => {
  let component: AnualReport;
  let fixture: ComponentFixture<AnualReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnualReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnualReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
