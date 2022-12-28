import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../components/calendar/calendar.component';
import { getAllAbsences } from '../store/absence.actions';
import { AppState } from '../store/absence.reducer';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private store: Store<{ appState: AppState }>
    ) { }

    BASE_URL: string = 'http://localhost:3333';
    API: string = 'api/users';
    userIsAuthenticated?: boolean;

    registerUser(user: User) {
        return this.http.post<User>(`${this.BASE_URL}/${this.API}`, user);
    }

    updateAbsences() {
        this.store.select(store => store.appState.user).subscribe(user => this.store.dispatch(getAllAbsences(user)));
    }

    authenticateUser(user: User) {
        const params = new HttpParams().append('user', JSON.stringify(user));
        return this.http.get<User>(`${this.BASE_URL}/${this.API}`, { params });
    }

    setUserIsAuthenticated(status: boolean) {
        localStorage.setItem('userAuthenticated', 'true');
        return this.userIsAuthenticated = status;
    }

    getUserIsAuthenticated() {
        return this.userIsAuthenticated;
    }
}


