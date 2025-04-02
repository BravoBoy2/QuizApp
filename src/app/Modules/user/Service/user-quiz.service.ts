import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../../../Shared/User';

@Injectable({
  providedIn: 'root'
})
export class UserQuizService {

  constructor(private http: HttpClient) { }

  // Retrieve all quizzes using Angular proxy
  getAllQuizzes(): Observable<any> {
    return this.http.get('/api/quiz');
  }

  getQuizQuestions(quizId: number) : Observable<any>{
    return this.http.get(`/api/quiz/${quizId}`);
  }

  // Update method to submit user's quiz answers with the correct field name
  submitQuiz(quizId: number, userId: number, responses: any[]): Observable<any> {
    const submitData = {
      quizId: quizId,
      userId: userId,
      answers: responses  // Changed from 'responses' to 'answers' to match the backend DTO
    };
    return this.http.post('/api/quiz-submissions/submit', submitData);
  }

  /**
   * Gets quiz results for a specific user
   */
  getQuizResults(userId: number): Observable<any> {
    console.log(`Fetching quiz results for user ID: ${userId}`);
    return this.http.get(`/api/quiz-submissions/results/user/${userId}`).pipe(
      tap(results => console.log('API response for quiz results:', results)),
      catchError(error => {
        console.error('Error fetching quiz results:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Gets quiz results for a specific quiz
   */
  getQuizResultsByQuiz(quizId: number): Observable<any> {
    return this.http.get(`/api/quiz-submissions/results/quiz/${quizId}`);
  }

  /**
   * Gets the current logged-in user from localStorage
   * Returns a default user with ID 1 if no user is found
   */
  getCurrentUser(): { id: number, name?: string, email?: string, role?: string } {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          console.log('Retrieved user from localStorage:', user);
          return user;
        }
      }
      console.log('No user found in localStorage, using default userId: 1');
      // Default fallback user if none found in storage
      return { id: 1 };
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Error parsing JSON, return default user
      return { id: 1 };
    }
  }
}
