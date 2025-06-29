import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AnnualReport {
  constructor(private http: HttpClient) {}

  getAllReports(
    pageNo: number,
    pageSize: number,
    keyword: string,
    year?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNo', pageNo)
      .set('pageSize', pageSize)
      .set('keyword', keyword || '');

    if (year) {
      params = params.set('year', year);
    }

    return this.http.get<any>(`${environment.apiUrl}/annual-reports`, {
      params,
    });
  }

  uploadReport(formData: FormData): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/annual-reports/upload`,
      formData
    );
  }
}
