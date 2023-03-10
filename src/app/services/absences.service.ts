import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AbsenceItem, User, UserAbsence } from '../components/calendar/calendar.component';
import { AppState, AvailableDays } from '../store/absence.reducer';

@Injectable({
  providedIn: 'root',
})
export class AbsencesService {
  constructor(private http: HttpClient,
    private store: Store<{ appState: AppState }>) { }

  currentAbsenceDate!: string;
  currentAbsenceID!: number;

  BASE_URL: string = 'https://calendar-back-production-dfa3.up.railway.app';
  API: string = 'api/absences';

  getAllAbsences(token: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<AbsenceItem[]>(`${this.BASE_URL}/${this.API}`, { headers });
  }

  getAvailableDays() {
    let token!: string;
    this.store.select(store => store.appState.token).subscribe(userToken => (token = userToken));
    const params = new HttpParams().append('user', token);
    return this.http.get<AvailableDays>(`${this.BASE_URL}/${this.API}/availableDays`, { params, headers: this.getHeaders() });
  }

  addAbsence(absence: AbsenceItem) {
    return this.http.post(`${this.BASE_URL}/${this.API}`, absence, { headers: this.getHeaders() });
  }

  deleteAbsence(id: number) {
    return this.http.delete(`${this.BASE_URL}/${this.API}/${id}`);
  }

  updateAbsence(id: number, newAbsence: AbsenceItem) {
    return this.http.put(`${this.BASE_URL}/${this.API}/${id}`, newAbsence);
  }

  getHeaders() {
    let token!: string;
    this.store.select(store => store.appState.token).subscribe(userToken => (token = userToken))
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return headers;
  }

}
