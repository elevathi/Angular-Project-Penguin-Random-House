import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleCard } from './title-card';

describe('TitleCard', () => {
  let component: TitleCard;
  let fixture: ComponentFixture<TitleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
