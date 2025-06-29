import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  constructor(private http: HttpClient) {}

  // Get full instrument by ID (no map operator)
  getInstrumentByID(id: number): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/instruments/${id}`)
      .pipe(catchError(this.handleError));
  }

  submitAnswers(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/records`, payload);
  }

  getUserRecord(instrument_id: number, user_id: number, year: number) {
    return this.http.get<any>(
      `${environment.apiUrl}/records/${instrument_id}/${user_id}/${year}`
    );
  }

  updateAnswers(record_id: number, answers: any[]) {
    return this.http.patch(`${environment.apiUrl}/records/${record_id}`, {
      answers,
    });
  }

  updateStatus(recordId: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/records/${recordId}/status`, {
      status,
    });
  }

  // Handle errors
  private handleError(error: any): Observable<never> {
    console.error('Instrument Service Error:', error);
    return throwError(() => new Error(error?.message || 'Server error'));
  }
}
