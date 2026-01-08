import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorCard } from './author-card';

describe('AuthorCard', () => {
  let component: AuthorCard;
  let fixture: ComponentFixture<AuthorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
