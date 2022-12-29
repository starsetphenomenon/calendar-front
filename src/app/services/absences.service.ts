import { HttpClient, HttpParams } from '@angular/common/http';
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

  BASE_URL: string = 'http://localhost:3333';
  API: string = 'api/absences';

  getAllAbsences(token: string) {
    const params = new HttpParams().append('user', token);
    return this.http.get<AbsenceItem[]>(`${this.BASE_URL}/${this.API}`, { params });
  }

  getAvailableDays() {
    let token!: string;
    this.store.select(store => store.appState.token).subscribe(userToken => (token = userToken))
    const params = new HttpParams().append('user', token);
    return this.http.get<AvailableDays>(`${this.BASE_URL}/${this.API}/availableDays`, { params });
  }

  addAbsence(data: UserAbsence) {
    return this.http.post(`${this.BASE_URL}/${this.API}`, data);
  }

  deleteAbsence(id: number) {
    return this.http.delete(`${this.BASE_URL}/${this.API}/${id}`);
  }

  updateAbsence(id: number, newAbsence: AbsenceItem) {
    return this.http.put(`${this.BASE_URL}/${this.API}/${id}`, newAbsence);
  }
}
