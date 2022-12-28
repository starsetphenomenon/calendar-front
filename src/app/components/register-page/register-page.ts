import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { registerUser } from '../../store/absence.actions';
import { AppState } from '../../store/absence.reducer';

@Component({
    selector: 'register-page',
    templateUrl: './register-page.html',
    styleUrls: ['./register-page.scss']
})

export class RegisterPage implements OnInit, OnDestroy {

    destroy$: Subject<boolean> = new Subject<boolean>();
    userCreated?: boolean;
    userCreated$?: Observable<boolean>;
    errorMessage?: string;
    errorMessage$?: Observable<string>;

    constructor(
        private store: Store<{ appState: AppState }>,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.userCreated$ = this.store.select((store) => store.appState.userCreated);
        this.errorMessage$ = this.store.select((store) => store.appState.errorMessage);
        this.userCreated$
            .pipe(takeUntil(this.destroy$))
            .subscribe((userCreated) => {
                this.userCreated = userCreated;
                if (this.userCreated) {
                    setTimeout(_ => {
                        this.router.navigate(['/calendar']);
                    }, 3000);
                }
            });
        this.errorMessage$
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                this.errorMessage = message;                
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    registerForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        userName: new FormControl('', [Validators.required, Validators.minLength(4)]),
        password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });

    onSubmit() {
        const user = this.registerForm.value;
        this.store.dispatch(registerUser(user));
    }
}