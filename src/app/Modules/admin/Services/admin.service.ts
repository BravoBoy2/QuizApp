import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }


  createQuizTest(apiRoute: string, formData: any) : Observable<any>{
    const url = `/api/${apiRoute}`;
    return this.http.post(url, formData);
  }

  getAllQuizzes() : Observable<any>{
    const url = "/api/quiz";
    return this.http.get(url);
  }
}
