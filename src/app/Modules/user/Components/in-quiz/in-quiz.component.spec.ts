import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InQuizComponent } from './in-quiz.component';

describe('InQuizComponent', () => {
  let component: InQuizComponent;
  let fixture: ComponentFixture<InQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
