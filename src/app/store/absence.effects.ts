import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of, switchMap } from 'rxjs';
import { AbsencesService } from '../services/absences.service';
import { AuthGuardService } from '../services/auth-guard.service';
import { AuthService } from '../services/auth.service';
import * as actions from './absence.actions';


@Injectable()
export class AbsenceEffects {
  constructor(
    private actions$: Actions,
    private absencesService: AbsencesService,
    private authService: AuthService,
    private guardService: AuthGuardService,
  ) { }

  getAbsences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getAllAbsences),
      exhaustMap(({ token }) => {
        return this.absencesService.getAllAbsences(token);
      }),
      switchMap((absences) => {
        return [
          actions.updateAvailableDays(),
          actions.setAllAbsences({ absences }),
        ];
      }),
      catchError((error) => of(actions.setStatusError(), error))
    )
  );

  getDays$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateAvailableDays),
      exhaustMap(() => {
        return this.absencesService.getAvailableDays().pipe(
          map((availableDays) => {
            return actions.setAvailableDays({ availableDays });
          })
        );
      }),
      catchError((error) => of(actions.setStatusError(), error))
    )
  );

  addAbsence$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addAbsence),
      concatMap(({ absence, userToken }) => {
        return this.absencesService.addAbsence({ absence, userToken });
      }),
      switchMap(() => {
        this.authService.updateAbsences();
        return [actions.updateAvailableDays()];
      }),
      catchError((error) => of(actions.setStatusError(), error))
    )
  );

  deleteAbsence$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteAbsence),
      concatMap((action) => {
        return this.absencesService.deleteAbsence(action.payload);
      }),
      switchMap(() => {
        this.authService.updateAbsences();
        return [actions.updateAvailableDays()];
      }),
      catchError((error) => of(actions.setStatusError(), error))
    )
  );

  updateAbsence$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.updateAbsence),
      concatMap((action) => {
        return this.absencesService.updateAbsence(action.id, action.newAbsence);
      }),
      switchMap(() => {
        this.authService.updateAbsences();
        return [actions.updateAvailableDays()];
      }),
      catchError((error) => of(actions.setStatusError(), error))
    )
  );

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.registerUser),
      concatMap((user) => {
        return this.authService.registerUser(user)
          .pipe(
            catchError((error) => of(error)));
      }),
      switchMap((user) => {
        if (user.error) {
          return [actions.setErrorMessage({ message: user.error.message })];
        }
        setTimeout(_ => {
          this.authService.redirectToLogin();
        }, 3000);
        return [actions.setToken({ token: 'pending' })];
      }),
      catchError((error) => of(actions.setErrorMessage(error), error)),
    )
  );

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loginUser),
      concatMap((user) => {
        return this.authService.loginUser(user).pipe(
          catchError((error) => of(error)));
      }),
      switchMap((response) => {
        if (response.status !== 201) {
          return [actions.setErrorMessage({ message: response.error.message })];
        }
        this.guardService.setGuard(true);
        setTimeout(_ => {
          this.authService.redirectToCalendar();
        }, 3000);
        return [actions.setToken({ token: response.error.text })];
      }),

    )
  );

}
