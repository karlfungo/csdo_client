import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CampusService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  // ✅ Attach query parameters properly
  getCampuses(
    params: { pageNo?: number; pageSize?: number; keyword?: string } = {}
  ): Observable<any> {
    let httpParams = new HttpParams();

    if (params.pageNo !== undefined) {
      httpParams = httpParams.set('pageNo', params.pageNo.toString());
    }

    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }

    return this.http
      .get<any>(`${environment.apiUrl}/campuses`, {
        headers: this.headers,
        params: httpParams,
      })
      .pipe(catchError(this.handleError));
  }

  // ✅ Get a single campus by ID
  getCampusById(id: number): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/campuses/${id}`, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  // ✅ Create new campus
  createCampus(payload: {
    campus_name: string;
    is_extension: boolean;
    status?: string;
  }): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/campuses`, payload, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  // ✅ Update campus
  updateCampus(id: number, payload: any): Observable<any> {
    return this.http
      .put<any>(`${environment.apiUrl}/campuses/${id}`, payload, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  // ✅ Delete campus
  deleteCampus(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.apiUrl}/campuses/${id}`, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  // ✅ Get all campuses for dropdown (no pagination/filtering)
  getCampusesForDropdown(): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/campuses/dropdown`, {
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
