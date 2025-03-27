import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InQuizComponent } from './in-quiz.component';
import { UserQuizService } from '../../Service/user-quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { QuestionType } from '../../../../Shared/quiz';
// Replace deprecated HttpClientTestingModule
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

// Mock component to bypass standalone component imports
@Component({
  selector: 'app-mock-component',
  template: '',
})
class MockComponent {}

describe('InQuizComponent', () => {
  let component: InQuizComponent;
  let fixture: ComponentFixture<InQuizComponent>;
  let userQuizServiceSpy: jasmine.SpyObj<UserQuizService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockQuizData = {
    quizTestDTO: {
      id: 1,
      title: 'Test Quiz',
      description: 'A test quiz',
      time: '00:10:00',
    },
    questions: [
      {
        id: 101,
        questionText: 'What is a test question?',
        type: QuestionType.SINGLE,
        options: [
          { id: 201, answerText: 'Option 1', correct: true },
          { id: 202, answerText: 'Option 2', correct: false },
        ],
      },
      {
        id: 102,
        questionText: 'Select all that apply',
        type: QuestionType.MCQ,
        options: [
          { id: 203, answerText: 'Option A', correct: true },
          { id: 204, answerText: 'Option B', correct: false },
          { id: 205, answerText: 'Option C', correct: true },
        ],
      },
      {
        id: 103,
        questionText: 'Type your answer',
        type: QuestionType.TEXT,
        correctAnswer: 'test answer',
      },
    ],
  };

  beforeEach(async () => {
    // Create spies
    userQuizServiceSpy = jasmine.createSpyObj('UserQuizService', [
      'getQuizQuestions',
      'submitQuiz'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Setup spies
    userQuizServiceSpy.getQuizQuestions.and.returnValue(of(mockQuizData));
    userQuizServiceSpy.submitQuiz.and.returnValue(of({
      id: 1,
      quizId: 1,
      userId: 1,
      totalQuestions: 3,
      totalCorrectAnswers: 2,
      percentageCorrAnswer: 66.67
    }));

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule
      ],
      providers: [
        // Replace HttpClientTestingModule with the new API
        provideHttpClient(),
        provideHttpClientTesting(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '1' }) }
        },
        { provide: Router, useValue: routerSpy },
        { provide: UserQuizService, useValue: userQuizServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load quiz data when initialized', () => {
    expect(userQuizServiceSpy.getQuizQuestions).toHaveBeenCalledWith(1);
    expect(component.quiz()).toBeTruthy();
    expect(component.questions().length).toBe(3);
  });

  it('should create form controls for each question', () => {
    expect(component.answersArray.length).toBe(3);
    // Check first form group for single select question
    const firstFormGroup = component.answersArray.at(0);
    expect(firstFormGroup.get('questionId')?.value).toBe(101);
    expect(firstFormGroup.get('selectedOptionId')).toBeTruthy();
  });

  it('should navigate between questions', () => {
    expect(component.currentQuestionIndex()).toBe(0);

    component.goToNextQuestion();
    expect(component.currentQuestionIndex()).toBe(1);

    component.goToNextQuestion();
    expect(component.currentQuestionIndex()).toBe(2);

    // Should not go beyond last question
    component.goToNextQuestion();
    expect(component.currentQuestionIndex()).toBe(2);

    component.goToPreviousQuestion();
    expect(component.currentQuestionIndex()).toBe(1);

    // Direct navigation
    component.goToQuestion(0);
    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('should check if question is answered', () => {
    // Initially no questions are answered
    expect(component.isQuestionAnswered(0)).toBeFalsy();

    // Answer single select question
    const firstFormGroup = component.answersArray.at(0) as any;
    firstFormGroup.get('selectedOptionId').setValue(201);
    expect(component.isQuestionAnswered(0)).toBeTruthy();

    // Answer MCQ question
    const secondFormGroup = component.answersArray.at(1) as any;
    const optionsGroup = secondFormGroup.get('options');
    optionsGroup.get('option_203').setValue(true);
    expect(component.isQuestionAnswered(1)).toBeTruthy();

    // Answer text question
    const thirdFormGroup = component.answersArray.at(2) as any;
    thirdFormGroup.get('textAnswer').setValue('');
    expect(component.isQuestionAnswered(2)).toBeFalsy();

    thirdFormGroup.get('textAnswer').setValue('test answer');
    expect(component.isQuestionAnswered(2)).toBeTruthy();
  });

  it('should update progress value', () => {
    expect(component.getProgressValue()).toBe(0);

    // Answer first question
    const firstFormGroup = component.answersArray.at(0) as any;
    firstFormGroup.get('selectedOptionId').setValue(201);

    component.updateProgressValue();
    expect(component.getProgressValue()).toBeGreaterThan(0);

    // Answer all questions
    const secondFormGroup = component.answersArray.at(1) as any;
    const optionsGroup = secondFormGroup.get('options');
    optionsGroup.get('option_203').setValue(true);

    const thirdFormGroup = component.answersArray.at(2) as any;
    thirdFormGroup.get('textAnswer').setValue('test answer');

    component.updateProgressValue();
    expect(component.getProgressValue()).toBe(100);
  });

  it('should handle time up', fakeAsync(() => {
    // Set up timer
    component.remainingTime.set(5);
    component.setupTimer();

    // Fast-forward time
    tick(5001);

    // Time's up flag should be true
    expect(component.timeIsUp()).toBe(true);

    // Submit should have been called (via setTimeout)
    tick(1501);

    // Check if quiz was submitted
    expect(userQuizServiceSpy.submitQuiz).toHaveBeenCalled();
  }));

  it('should submit quiz when requested', () => {
    // Answer a question
    const firstFormGroup = component.answersArray.at(0) as any;
    firstFormGroup.get('selectedOptionId').setValue(201);

    // Mock confirm dialog to return true
    spyOn(window, 'confirm').and.returnValue(true);

    // Submit quiz
    component.submitQuiz();

    // Verify submission
    expect(userQuizServiceSpy.submitQuiz).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user/quiz-results', 1]);
  });

  it('should handle quiz submission failure', () => {
    // Override submitQuiz to return error
    userQuizServiceSpy.submitQuiz.and.returnValue(
      throwError(() => new Error('Submission failed'))
    );

    // Mock confirm dialog
    spyOn(window, 'confirm').and.returnValue(true);

    // Submit quiz
    component.submitQuiz();

    // Verify error handling
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      jasmine.stringMatching(/Failed to submit quiz/),
      'Close',
      jasmine.any(Object)
    );
  });
});
