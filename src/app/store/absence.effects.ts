import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of, switchMap } from 'rxjs';
import { AbsencesService } from '../services/absences.service';
import { AuthService } from '../services/auth.service';
import * as actions from './absence.actions';


@Injectable()
export class AbsenceEffects {
  constructor(
    private actions$: Actions,
    private absencesService: AbsencesService,
    private authService: AuthService,
  ) { }

  getAbsences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getAllAbsences),
      exhaustMap((user) => {
        return this.absencesService.getAllAbsences(user);
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
      concatMap(({ absence, user }) => {
        return this.absencesService.addAbsence({ absence, user });
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
          return [actions.setErrorMessage({ message: user.error.text })]
        }
        return [actions.setUser(user), actions.userCreated(user)];
      }),
      catchError((error) => of(actions.setErrorMessage(error), error)),
    )
  );

  authenticateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.authenticateUser),
      concatMap((user) => {
        return this.authService.authenticateUser(user).pipe(
          catchError((error) => of(error)));
      }),
      switchMap((user) => {
        if (user.error) {
          return [actions.isAuthenticated({ status: false }), actions.setErrorMessage({ message: user.error.text })]
        }
        return [actions.setUser(user), actions.isAuthenticated({ status: !!user })];
      }),

    )
  );

}
