import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { loginUser, setErrorMessage } from '../../store/absence.actions';
import { AppState } from '../../store/absence.reducer';

@Component({
    selector: 'login-page',
    templateUrl: './login-page.html',
    styleUrls: ['./login-page.scss']
})
export class LoginPage implements OnInit, OnDestroy {

    destroy$: Subject<boolean> = new Subject<boolean>();
    errorMessage?: string;
    errorMessage$?: Observable<string>;
    userToken?: string;
    userToken$?: Observable<string>;

    constructor(
        private store: Store<{ appState: AppState }>,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.userToken$ = this.store.select((store) => store.appState.token);
        this.userToken$
            .pipe(takeUntil(this.destroy$))
            .subscribe((token) => {
                this.userToken = token;
            });
        this.errorMessage$ = this.store.select((store) => store.appState.errorMessage);
        this.errorMessage$
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                this.errorMessage = message;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
        this.store.dispatch(setErrorMessage({ message: '' }));
    }

    loginForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.minLength(4), Validators.email],),
        password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });

    onSubmit() {
        const user = this.loginForm.value;
        this.store.dispatch(loginUser(user));
    }

    goToRegister() {
        this.router.navigate(['/register']);
    }
}