import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserQuizService {
  constructor(private http: HttpClient) {}

  /**
   * Gets all available quizzes
   */
  getAllQuizzes(): Observable<any> {
    return this.http.get('/api/quiz');
  }

  /**
   * Gets a specific quiz with all its questions
   */
  getQuizQuestions(quizId: number): Observable<any> {
    return this.http.get(`/api/quiz/${quizId}`);
  }

  /**
   * Submits a completed quiz to the backend for grading
   * Formats the data according to our Spring Boot API expectations
   */
  submitQuiz(quizId: number, userId: number, answers: any[]): Observable<any> {
    // Format the answers to match our QuizSubmissionDTO structure
    const formattedAnswers = answers.map(answer => {
      return {
        questionId: answer.questionId,
        textAnswer: answer.textAnswer || null,
        selectedOptionIds: answer.selectedOptionIds || []
      };
    });

    // Create the quiz submission object with the structure expected by our backend
    const submission = {
      quizId: quizId,
      userId: userId,
      answers: formattedAnswers
    };

    console.log('Submitting quiz with payload:', submission);

    return this.http.post('/api/quiz-submissions/submit', submission);
  }

  /**
   * Helper method to get quiz results for a user
   */
  getQuizResults(userId: number): Observable<any> {
    return this.http.get(`/api/quiz-submissions/results/user/${userId}`);
  }

  /**
   * Helper method to get quiz results for a specific quiz
   */
  getQuizResultsByQuiz(quizId: number): Observable<any> {
    return this.http.get(`/api/quiz-submissions/results/quiz/${quizId}`);
  }
}
