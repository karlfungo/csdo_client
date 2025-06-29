import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(params: {
    pageNo: number;
    pageSize: number;
    keyword: string;
  }): Observable<{ data: any[]; total: number }> {
    const httpParams = new HttpParams()
      .set('pageNo', params.pageNo)
      .set('pageSize', params.pageSize)
      .set('keyword', params.keyword);

    return this.http.get<{ data: any[]; total: number }>(
      `${environment.apiUrl}/users`,
      { params: httpParams }
    );
  }

  // Optional: Add, Update, Delete user functions
  addUser(user: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users`, user);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${id}`, user);
  }

  // ✅ Get all SDO users (for dropdown, etc.)
  getSdoUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/sdo`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }
}
