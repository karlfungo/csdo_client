import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Sdgs {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  // ✅ GET all SDGs
  getAllSdgs(): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/sdgs`, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage =
      error.error?.message || `Error ${error.status}: ${error.statusText}`;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
