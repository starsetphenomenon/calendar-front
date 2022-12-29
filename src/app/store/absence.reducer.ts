import { createReducer, on } from '@ngrx/store';
import { AbsenceItem, User } from '../components/calendar/calendar.component';
import {
  addAbsence,
  deleteAbsence,
  getAllAbsences,
  registerUser,
  setAllAbsences,
  setAvailableDays,
  setErrorMessage,
  setStatusError,
  setStatusPending,
  setStatusSucces,
  setToken,
  updateAbsence,
  updateAvailableDays,
} from './absence.actions';

export interface AvailableDays {
  sick: {
    entitlement: number;
    taken: number;
  };
  vacation: {
    entitlement: number;
    taken: number;
  };
}

export interface Dialogs {
  requestDialog: boolean;
  updateDialog: boolean;
}

export interface AppState {
  absences: AbsenceItem[];
  availableDays: AvailableDays;
  status: 'pending' | 'success' | 'error';
  errorMessage: string;
  token: string;
}

const initialState: AppState = {
  availableDays: {
    sick: {
      entitlement: 0,
      taken: 0,
    },
    vacation: {
      entitlement: 0,
      taken: 0,
    },
  },
  absences: [],
  status: 'pending',
  errorMessage: '',
  token: '',
};

export const absenceReducer = createReducer(
  initialState,
  on(getAllAbsences, (state) => {
    return {
      ...state,
      status: 'pending',
    };
  }),
  on(setAllAbsences, (state: AppState, action) => {
    return {
      ...state,
      absences: action.absences,
      status: 'success',
    };
  }),
  on(setAvailableDays, (state: AppState, action) => {
    return {
      ...state,
      availableDays: action.availableDays,
      status: 'success',
    };
  }),
  on(updateAvailableDays, (state: AppState, _) => {
    return {
      ...state,
      status: 'pending',
    };
  }),
  on(addAbsence, (state) => {
    return {
      ...state,
      status: 'pending',
    };
  }),
  on(updateAbsence, (state) => {
    return {
      ...state,
      status: 'pending',
    };
  }),
  on(deleteAbsence, (state) => {
    return {
      ...state,
      status: 'pending',
    };
  }),
  on(setStatusSucces, (state) => {
    return {
      ...state,
      status: 'success',
    };
  }),
  on(setStatusPending, (state) => {
    return {
      ...state,
      status: 'pending',
    };
  }),
  on(setStatusError, (state) => {
    return {
      ...state,
      status: 'error',
    };
  }),
  on(registerUser, (state) => {
    return {
      ...state,
      userCreated: false,
    };
  }),
  on(setToken, (state, action) => {
    return {
      ...state,
      token: action.token,
    };
  }),
  on(setErrorMessage, (state, action) => {
    return {
      ...state,
      errorMessage: action.message,
    };
  })
);
