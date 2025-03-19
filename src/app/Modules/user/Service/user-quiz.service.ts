import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserQuizService {

  constructor(private http: HttpClient) { }

  // Retrieve all quizzes using Angular proxy
  getAllQuizzes(): Observable<any> {
    return this.http.get('/api/quiz');
  }
}
