import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbsenceItem } from '../components/calendar/calendar.component';
import { AvailableDays } from '../store/absence.reducer';

@Injectable({
  providedIn: 'root',
})
export class AbsencesService {
  constructor(private http: HttpClient) {}

  currentAbsenceDate!: string;
  currentAbsenceID!: number;

  BASE_URL: string = 'https://calendar-backend-wgfa.onrender.com';
  API: string = 'api/absences';

  getAllAbsences() {
    return this.http.get<AbsenceItem[]>(`${this.BASE_URL}/${this.API}`);
  }

  getAvailableDays() {
    return this.http.get<AvailableDays>(
      `${this.BASE_URL}/${this.API}/availableDays`
    );
  }

  addAbsence(absence: AbsenceItem) {
    return this.http.post(`${this.BASE_URL}/${this.API}`, absence);
  }

  deleteAbsence(id: number) {
    return this.http.delete(`${this.BASE_URL}/${this.API}/${id}`);
  }

  updateAbsence(id: number, newAbsence: AbsenceItem) {
    return this.http.put(`${this.BASE_URL}/${this.API}/${id}`, newAbsence);
  }
}
