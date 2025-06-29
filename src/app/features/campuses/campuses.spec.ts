import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Campuses } from './campuses';

describe('Campuses', () => {
  let component: Campuses;
  let fixture: ComponentFixture<Campuses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Campuses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Campuses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
