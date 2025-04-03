import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, Question } from '../Shared/quiz';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = 'http://localhost:8080/api'; // Base URL for the backend API

  constructor(private http: HttpClient) { }

  // Create a new quiz or test
  createQuizTest(path: string, formData: any): Observable<any> {
    const url = `${this.baseUrl}/${path}`; // Construct the API endpoint
    return this.http.post(url, formData); // Send POST request
  }

  // Get all quizzes from the backend
  getAllQuizzes(): Observable<Quiz[]> {
    const url = `${this.baseUrl}/quiz`; // API endpoint for fetching quizzes
    return this.http.get<Quiz[]>(url); // Send GET request
  }
}
