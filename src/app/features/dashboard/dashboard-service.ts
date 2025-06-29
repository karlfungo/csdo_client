import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStatusAndSdgSummary(campusId?: number, year?: number) {
    let params = new HttpParams();
    if (campusId) params = params.set('campus_id', campusId);
    if (year) params = params.set('year', year);

    return this.http.get(`${environment.apiUrl}/dashboard/${campusId}/${year}`);
  }

  getScores(campusId?: number, year?: number) {
    let params = new HttpParams();
    if (campusId) params = params.set('campus_id', campusId);
    if (year) params = params.set('year', year);

    return this.http.get(
      `${environment.apiUrl}/dashboard/score/${campusId}/${year}`
    );
  }

  getCampusRankings(year: number, sdg_id: number) {
    return this.http.get(
      `${environment.apiUrl}/dashboard/rank/${year}/${sdg_id}`
    );
  }
}
