import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Instrument {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  // Create a new instrument
  createInstrument(payload: any): Observable<any> {
    console.log(payload, 'Payload for creation');

    return this.http
      .post<any>(`${environment.apiUrl}/instruments`, payload, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Get full instrument by ID (no map operator)
  getInstrumentByID(id: number): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/instruments/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ✅ Get all instruments
  getInstruments(params: {
    pageNo: number;
    pageSize: number;
    keyword: string;
  }) {
    return this.http
      .get<any[]>(`${environment.apiUrl}/instruments`, {
        params: {
          pageNo: params.pageNo.toString(),
          pageSize: params.pageSize.toString(),
          keyword: params.keyword,
        },
      })
      .pipe(catchError(this.handleError));
  }

  // Handle errors
  private handleError(error: any): Observable<never> {
    console.error('Instrument Service Error:', error);
    return throwError(() => new Error(error?.message || 'Server error'));
  }
}
