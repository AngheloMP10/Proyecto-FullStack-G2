import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFa } from './two-fa';

describe('TwoFa', () => {
  let component: TwoFa;
  let fixture: ComponentFixture<TwoFa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
