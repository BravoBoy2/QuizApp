import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, Question } from '../Shared/quiz';

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

  createQuizTest(path: string, formData: any): Observable<any> {
    const url = `${this.baseUrl}/${path}`;
    return this.http.post(url, formData, this.httpOptions);
  }

  // Fix the method signature to accept 2 parameters

  // Get all quizzes
  getAllQuizzes(): Observable<Quiz[]> {
    const url = `${this.baseUrl}/quiz`;
    return this.http.get<Quiz[]>(url);
  }
}
