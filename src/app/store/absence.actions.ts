import { createAction, props } from '@ngrx/store';
import { AbsenceItem } from '../components/calendar/calendar.component';
import { AvailableDays } from './absence.reducer';

export const getAllAbsences = createAction('[Absences API] Get All Absences');

export const setAllAbsences = createAction(
  '[Absences] Get All Absences',
  props<{ absences: AbsenceItem[] }>()
);

export const setAvailableDays = createAction(
  '[Days] Get Available Days',
  props<{ availableDays: AvailableDays }>()
);

export const updateAvailableDays = createAction('[Days] Update Available Days');

export const addAbsence = createAction(
  '[Absences] Add Absence',
  props<AbsenceItem>()
);

export const deleteAbsence = createAction(
  '[Absences] Delete Absence',
  props<{ payload: number }>()
);

export const updateAbsence = createAction(
  '[Absences] Update Absence',
  props<{ id: number; newAbsence: AbsenceItem }>()
);

export const setStatusSucces = createAction('[Status] Set Status Secces');

export const setStatusPending = createAction('[Status] Set Status Pending');

export const setStatusError = createAction('[Status] Set Status Error');
