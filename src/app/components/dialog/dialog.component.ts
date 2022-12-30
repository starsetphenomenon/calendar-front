import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { AbsenceItem, AbsenceType, User } from '../calendar/calendar.component';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AbsencesService } from '../../services/absences.service';
import { select, Store } from '@ngrx/store';
import { map, Subject, takeUntil } from 'rxjs';
import { AppState, Dialogs } from '../../store/absence.reducer';
import {
  addAbsence,
  deleteAbsence,
  setStatusPending,
  updateAbsence,
} from '../../store/absence.actions';

interface AvailableDays {
  sick: number;
  vacation: number;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() absenceTypes?: AbsenceType[];
  @Input() name!: string;
  @Input() showDialog!: boolean;
  @Input() currentAbsence!: AbsenceItem;
  @Input() title!: string;
  @Input() dialogs!: Dialogs;
  @Input() token!: string;

  @Output() closeDialog = new EventEmitter<Dialogs>();

  destroy$: Subject<boolean> = new Subject<boolean>();
  dateNow = new Date();
  absenceForm!: FormGroup;
  maxDate = null;
  minDate = null;
  isTaken = false;
  outOfDays = false;
  availableDays: AvailableDays = {
    sick: 0,
    vacation: 0,
  };
  absences: AbsenceItem[] = [];

  constructor(
    private absencesService: AbsencesService,
    private store: Store<{ appState: AppState }>
  ) { }

  ngOnInit() {
    this.store
      .select((store) => store.appState.availableDays)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        Object.keys(this.availableDays).forEach(
          (key) =>
          (this.availableDays[key as keyof AvailableDays] =
            value[key as keyof AvailableDays].entitlement -
            value[key as keyof AvailableDays].taken)
        );
      });
    this.store
      .pipe(
        select('appState'),
        map((state: AppState) => state.absences),
        takeUntil(this.destroy$)
      )
      .subscribe((absences) => (this.absences = absences));

    this.absenceForm = new FormGroup({
      absenceType: new FormControl('sick', Validators.required),
      fromDate: new FormControl(this.dateNow, Validators.required),
      toDate: new FormControl(this.dateNow, Validators.required),
      comment: new FormControl('', Validators.required),
    });

    this.absenceForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedValue) => {
        this.maxDate = selectedValue.toDate;
        this.minDate = selectedValue.fromDate;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: any) {
    if (changes.showDialog) {
      if (this.absenceForm) {
        this.absenceForm.patchValue({
          absenceType: this.currentAbsence.absenceType,
          fromDate: this.currentAbsence.fromDate,
          toDate: this.currentAbsence.toDate,
          comment: '',
        });
        if (this.dialogs.requestDialog) {
          this.absenceForm.patchValue({
            absenceType: this.currentAbsence.absenceType,
            fromDate: this.absencesService.currentAbsenceDate,
            toDate: this.absencesService.currentAbsenceDate,
            comment: '',
          });
        }
      }
    }
  }

  onUpdateAbsence() {
    if (this.checkDaysAvailability()) {
      this.outOfDays = true;
      return;
    }

    let absencesArrayExceptCurrent = this.absences.filter(
      (absence) => absence.id !== this.currentAbsence.id
    );
    this.checkDaysBetween(absencesArrayExceptCurrent, this.absenceForm.value);
    if (this.isTaken) {
      return;
    }

    this.changeDateFormat(this.absenceForm.value);
    this.absenceForm.value.comment = this.currentAbsence.comment;
    this.store.dispatch(setStatusPending());
    this.store.dispatch(
      updateAbsence({
        id: this.absencesService.currentAbsenceID,
        newAbsence: this.absenceForm.value,
      })
    );
    this.handleDialogView(false);
  }

  handleDialogView(state: boolean) {
    this.outOfDays = false;
    this.isTaken = false;
    this.closeDialog.emit({ ...this.dialogs, [this.name]: state });
    this.absenceForm.patchValue({
      absenceType: this.currentAbsence.absenceType,
      fromDate: this.absencesService.currentAbsenceDate,
      toDate: this.absencesService.currentAbsenceDate,
    });
  }

  deleteAbsence() {
    this.store.dispatch(
      deleteAbsence({ payload: this.absencesService.currentAbsenceID })
    );
    this.handleDialogView(false);
  }

  onRequest(data: AbsenceItem) {
    if (this.checkDaysAvailability()) {
      this.outOfDays = true;
      return;
    }

    this.checkDaysBetween(this.absences, data);
    if (this.isTaken) {
      return;
    }

    this.changeDateFormat(data);
    this.store.dispatch(setStatusPending());
    this.store.dispatch(addAbsence(data));
    this.handleDialogView(false);
  }

  changeDateFormat(value: AbsenceItem) {
    value.fromDate = moment(value.fromDate).format('YYYY-MM-DD');
    value.toDate = moment(value.toDate).format('YYYY-MM-DD');
  }

  checkDaysAvailability() {
    let currentAbsenceDuration =
      moment
        .duration(
          moment(this.currentAbsence.toDate).diff(this.currentAbsence.fromDate)
        )
        .asDays() + 1;
    let currentFormDuration =
      moment
        .duration(
          moment(this.absenceForm.value.toDate).diff(
            this.absenceForm.value.fromDate
          )
        )
        .asDays() + 1;
    if (this.dialogs.updateDialog) {
      currentFormDuration = currentFormDuration - currentAbsenceDuration;
    }
    return (
      currentFormDuration >
      this.availableDays[
      this.absenceForm.value.absenceType as keyof AvailableDays
      ]
    );
  }

  checkDaysBetween(absencesArray: AbsenceItem[], checkDate: any) {
    this.isTaken = false;
    absencesArray.forEach((absence) => {
      if (
        moment(checkDate.fromDate).isBetween(
          absence.fromDate,
          absence.toDate,
          null,
          '[]'
        ) ||
        moment(checkDate.toDate).isBetween(
          absence.fromDate,
          absence.toDate,
          null,
          '[]'
        ) ||
        moment(absence.toDate).isBetween(
          checkDate.fromDate,
          checkDate.toDate,
          null,
          '[]'
        )
      ) {
        return (this.isTaken = true);
      }
      return this.isTaken;
    });
  }
}
