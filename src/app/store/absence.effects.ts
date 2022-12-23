import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of, switchMap } from 'rxjs';
import { AbsencesService } from '../services/absences.service';
import * as actions from './absence.actions';

@Injectable()
export class AbsenceEffects {
  constructor(
    private actions$: Actions,
    private absencesService: AbsencesService
  ) {}

  getAbsences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.getAllAbsences),
      exhaustMap(() => {
        return this.absencesService.getAllAbsences();
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
      concatMap((absence) => {
        return this.absencesService.addAbsence(absence);
      }),
      switchMap(() => {
        return [actions.getAllAbsences(), actions.updateAvailableDays()];
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
        return [actions.getAllAbsences(), actions.updateAvailableDays()];
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
        return [actions.getAllAbsences(), actions.updateAvailableDays()];
      }),
      catchError((error) => of(actions.setStatusError(), error))
    )
  );
}
