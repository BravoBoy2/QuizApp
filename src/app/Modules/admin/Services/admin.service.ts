import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Quiz, Question } from '../../../Shared/quiz';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = 'http://localhost:8080/api'; // Ensure this is the correct base URL for your backend
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Add the method with two parameters
  addQuestionToQuiz(quizId: number, questions: Question[]): Observable<Quiz> {
    const url = `${this.baseUrl}/quiz/${quizId}/questions`;
    console.log(`Sending request to: ${url}`);
    console.log('Request payload:', JSON.stringify(questions));
    return this.http.post<Quiz>(url, questions, this.httpOptions);
  }

  //Submit Quiz form
  createQuizTest(apiRoute: string, formData: any) : Observable<any>{
    const url = `${this.baseUrl}/${apiRoute}`;
    return this.http.post(url, formData, this.httpOptions);
  }

  //retrieve the all the quizzes
  getAllQuizzes() : Observable<any>{
    const url = `${this.baseUrl}/quiz`;
    return this.http.get(url);
  }
  getQuizQuestions(quizId: number) : Observable<any>{
    return this.http.get(`${this.baseUrl}/quiz/${quizId}`);
  }

  // Get quiz results for all users
  getAllQuizResults(): Observable<any> {
    return this.http.get(`${this.baseUrl}/quiz-submissions/results`).pipe(
      tap(results => console.log('Retrieved all quiz results:', results)),
      catchError(error => {
        console.error('Error fetching all quiz results:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  // Get results for specific user
  getUserResults(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quiz-submissions/results/user/${userId}`).pipe(
      catchError(error => {
        console.error(`Error fetching results for user ${userId}:`, error);
        return of([]);
      })
    );
  }

  // Get results for specific quiz
  getQuizResults(quizId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/quiz-submissions/results/quiz/${quizId}`).pipe(
      catchError(error => {
        console.error(`Error fetching results for quiz ${quizId}:`, error);
        return of([]);
      })
    );
  }
}
