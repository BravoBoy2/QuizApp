import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, Question } from './quiz';

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
}
