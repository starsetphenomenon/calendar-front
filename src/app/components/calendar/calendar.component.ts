import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AbsencesService } from '../../services/absences.service';
import { Store } from '@ngrx/store';
import { AppState, AvailableDays, Dialogs } from '../../store/absence.reducer';
import { getAllAbsences, setStatusPending, setToken } from '../../store/absence.actions';

export enum AbsenceTypeEnums {
  ALL = 'all',
  SICK = 'sick',
  VACATION = 'vacation',
}

interface CalendarItem {
  day: string;
  dayName: string;
  className: string;
  isWeekend: boolean;
  absence: AbsenceItem;
  fullDate: string;
}

export interface UserAbsence {
  userToken: string;
  absence: AbsenceItem;
}

export interface User {
  id?: number;
  userName: string;
  email: string;
  password: string;
}

export interface AbsenceItem {
  id: number;
  absenceType: string;
  fromDate: string;
  toDate: string;
  comment: string;
  userName?: string;
}

export interface AbsenceType {
  value: AbsenceTypeEnums;
  viewValue: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  date = moment();
  dateNow = new Date();
  calendar: Array<CalendarItem[]> = [];
  calendarType: string = 'month';
  months = moment.months();
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  selectedAbsenceFilter = '';
  selectedAbsenceType = 'sick';
  AbsenceTypeEnums = AbsenceTypeEnums;
  absenceTypes: AbsenceType[] = [
    { value: AbsenceTypeEnums.ALL, viewValue: 'All' },
    { value: AbsenceTypeEnums.SICK, viewValue: 'Sick' },
    { value: AbsenceTypeEnums.VACATION, viewValue: 'Vacation' },
  ];
  currentAbsence: AbsenceItem = {
    id: 0,
    absenceType: 'sick',
    fromDate: this.absencesService.currentAbsenceDate,
    toDate: this.absencesService.currentAbsenceDate,
    comment: '',
  };

  availableDays: AvailableDays = {
    sick: {
      entitlement: 20,
      taken: 0,
    },
    vacation: {
      entitlement: 10,
      taken: 0,
    },
  };
  dialogs: Dialogs = {
    requestDialog: false,
    updateDialog: false,
  };
  absences: AbsenceItem[] = [];
  absencesArray$?: Observable<AbsenceItem[]>;
  availableDays$?: Observable<AvailableDays>;
  status?: string;
  status$?: Observable<string>;
  token$?: Observable<string>;
  token!: string;
  localToken!: string;

  constructor(
    public absencesService: AbsencesService,
    private store: Store<{ appState: AppState }>
  ) { }

  ngOnInit(): void {
    this.localToken = JSON.parse(localStorage.getItem('token') as string);
    if (this.localToken) {
      this.store.dispatch(setToken({ token: this.localToken }));
    }
    this.token$ = this.store.select((store) => store.appState.token);
    this.token$
      .pipe(takeUntil(this.destroy$))
      .subscribe((token) => {
        localStorage.setItem('token', JSON.stringify(token));
        this.token = token;

      });
    this.store.dispatch(getAllAbsences({ token: this.token }));
    this.availableDays$ = this.store.select(
      (store) => store.appState.availableDays
    );
    this.availableDays$
      .pipe(takeUntil(this.destroy$))
      .subscribe((availableDays) => (this.availableDays = availableDays));
    this.status$ = this.store.select((store) => store.appState.status);
    this.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => (this.status = status));
    this.absencesArray$ = this.store.select((store) => store.appState.absences);
    this.absencesArray$.pipe(takeUntil(this.destroy$)).subscribe((absences) => {
      if (!absences) {
        this.store.dispatch(setStatusPending());
        return;
      }
      this.status === 'success'
        ? (this.absences = absences)
        : (this.absences = []);
      this.calendar = this.createCalendar(
        this.date,
        this.selectedAbsenceFilter
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    localStorage.removeItem('token');
  }

  filterByAbsence() {
    this.calendar = this.createCalendar(this.date, this.selectedAbsenceFilter);
  }

  updateAbsence(fullDate: string, id: number) {
    this.absencesService.currentAbsenceDate = fullDate;
    this.absencesService.currentAbsenceID = id;
    let currentAbsence = this.absences.find((item) => item.id === id);
    if (currentAbsence) {
      this.currentAbsence = { ...currentAbsence };
    }
    this.handleDialogView(true, 'updateDialog', fullDate);
  }

  handleDialogView(state: boolean, dialog: string, currentDay: string) {
    currentDay
      ? (this.absencesService.currentAbsenceDate = currentDay)
      : (this.absencesService.currentAbsenceDate = moment(this.dateNow).format(
        'YYYY-MM-DD'
      ));

    if (dialog === 'requestDialog') {
      this.currentAbsence = {
        id: Date.now(),
        absenceType: 'vacation',
        fromDate: moment(this.dateNow).format('YYYY-MM-DD').toString(),
        toDate: moment(this.absencesService.currentAbsenceDate).format(
          'DD/MM/YYYY'
        ),
        comment: '',
      };
    }
    this.dialogs = { ...this.dialogs, [dialog]: state };
  }

  setCalendarType(value: string) {
    this.calendarType = value;
  }

  setCurrentMonth(e: any) {
    this.calendarType = 'month';
    this.calendar = this.createCalendar(
      this.date.month(e.target.getAttribute('name')),
      this.selectedAbsenceFilter
    );
  }

  createCalendar(month: moment.Moment, filter: string) {
    if (!filter) {
      filter = 'all';
    }
    let absences = this.absences;
    let sickTakenDays = 0;
    let vacationTakenDays = 0;
    absences.forEach((absence) => {
      if (absence.absenceType === AbsenceTypeEnums.SICK) {
        sickTakenDays +=
          moment
            .duration(moment(absence.toDate).diff(absence.fromDate))
            .asDays() + 1;
      }
      if (absence.absenceType === AbsenceTypeEnums.VACATION) {
        vacationTakenDays +=
          moment
            .duration(moment(absence.toDate).diff(absence.fromDate))
            .asDays() + 1;
      }
    });

    if (filter !== AbsenceTypeEnums.ALL) {
      absences = absences.filter((absence) => absence.absenceType === filter);
    }

    const daysInMonth = month.daysInMonth();
    const startOfMonth = month.startOf('months').format('ddd');
    const endOfMonth = month.endOf('months').format('ddd');
    const weekdaysShort = this.weekDays;
    const calendar: CalendarItem[] = [];

    const daysBefore = weekdaysShort.indexOf(startOfMonth);
    const daysAfter =
      weekdaysShort.length - 1 - weekdaysShort.indexOf(endOfMonth);

    const clone = month.startOf('months').clone();
    if (daysBefore > 0) {
      clone.subtract(daysBefore, 'days');
    }

    for (let i = 0; i < daysBefore; i++) {
      calendar.push(this.createCalendarItem(clone, 'previous-month', absences));
      clone.add(1, 'days');
    }

    for (let i = 0; i < daysInMonth; i++) {
      calendar.push(this.createCalendarItem(clone, 'in-month', absences));
      clone.add(1, 'days');
    }

    for (let i = 0; i < daysAfter; i++) {
      calendar.push(this.createCalendarItem(clone, 'next-month', absences));
      clone.add(1, 'days');
    }

    let result = calendar.reduce(
      (pre: Array<CalendarItem[]>, curr: CalendarItem) => {
        absences.forEach((absence) => {
          if (
            moment(curr.fullDate).isBetween(absence.fromDate, absence.toDate)
          ) {
            curr.absence = {
              id: absence.id,
              absenceType: absence.absenceType,
              fromDate: absence.fromDate,
              toDate: absence.toDate,
              comment: absence.comment,
            };
          }
        });
        if (pre[pre.length - 1].length < weekdaysShort.length) {
          pre[pre.length - 1].push(curr);
        } else {
          pre.push([curr]);
        }
        return pre;
      },
      [[]]
    );

    return result;
  }

  createCalendarItem(
    data: moment.Moment,
    className: string,
    absences: AbsenceItem[]
  ) {
    const dayName = data.format('ddd');
    let absenceItem = {
      id: 0,
      absenceType: '',
      fromDate: '',
      toDate: '',
      comment: '',
    };
    absences.forEach((absence) => {
      if (
        absence.fromDate === data.format('YYYY-MM-DD') ||
        absence.toDate === data.format('YYYY-MM-DD')
      ) {
        absenceItem = {
          id: absence.id,
          absenceType: absence.absenceType,
          fromDate: absence.fromDate,
          toDate: absence.toDate,
          comment: absence.comment,
        };
      }
    });

    return {
      day: data.format('DD'),
      dayName,
      className,
      isWeekend: dayName === 'Sun' || dayName === 'Sat',
      fullDate: data.format('YYYY-MM-DD'),
      absence: absenceItem,
    };
  }

  setCurrentDate(val: number, type: any) {
    this.date.add(val, type);
    this.calendar = this.createCalendar(this.date, this.selectedAbsenceFilter);
  }

  setTodaysDate() {
    this.date = moment();
    this.calendar = this.createCalendar(this.date, this.selectedAbsenceFilter);
  }

  closeDialog(dialogs: Dialogs) {
    return (this.dialogs = { ...dialogs });
  }
}
