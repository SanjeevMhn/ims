import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChevronLeft, ChevronRight, LucideAngularModule, Pencil, Plus, Trash2, X } from 'lucide-angular';
import { BehaviorSubject, map, tap, combineLatest } from 'rxjs';
import { Event } from '../../shared/services/event';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [LucideAngularModule, AsyncPipe, ReactiveFormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  chevronleft = ChevronLeft;
  chevronright = ChevronRight;
  plusIcon = Plus
  activeEvent: any | null = null;
  currentMonthForm = new FormGroup({
    month: new FormControl(''),
  });

  currentViewFormControl = new FormControl('');

  @Output() showAddEventFormOutput = new EventEmitter();
  @Output() showEventOutput = new EventEmitter();

  view = new BehaviorSubject<'month' | 'week'>('month');

  viewChange$ = this.view.pipe(
    map((view) => view),
    tap((view) => {
      if (view == 'week') {
        this.currentViewFormControl.setValue('week');
        this.selectedWeek$.next(this.currentWeek + 1);
      } else {
        this.currentViewFormControl.setValue('month');
        this.selectedWeek$.next(null);
      }
    })
  );

  currentMonthFormatted = new Date().getFullYear() + '-' + new Date().getMonth();
  currentMonth = new BehaviorSubject<string>(this.currentMonthFormatted.toString());
  selectedWeek$ = new BehaviorSubject<number | null>(null);
  totalWeeks = 0;
  currentWeek = 0;


  getWeeks$ = combineLatest([this.currentMonth, this.selectedWeek$]).pipe(
    map(([date, week]) => {
      let [year, month] = date.split('-');
      let formatted = String(year + '-' + (Number(month) + 1).toString().padStart(2, '0'));
      this.currentMonthForm.get('month')?.setValue(formatted);
      let firstDay = new Date(Number(year), Number(month), 1).getDay();
      let lastDay = new Date(Number(year), Number(month) + 1, 0).getDate();
      this.totalWeeks = Math.ceil((firstDay + lastDay) / 7);
      return {
        year: year,
        month: month,
        lastDay: lastDay,
        week: week,
      };
    }),
    map((data) => {
      //current month's days
      let days = [];
      for (let i = 1; i <= data.lastDay; i++) {
        let date: Date = new Date(Number(data.year), Number(data.month), i);
        days.push({
          day: date.getDay(),
          dayIndex: date.getDate(),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          monthName: date.toLocaleDateString('en-US', { month: 'short' }),
          fullDate:
            data.year +
            '-' +
            (Number(data.month) + 1).toString().padStart(2, '0') +
            '-' +
            date.getDate().toString().padStart(2, '0'),
          is_current: true,
        });
      }

      let firstDay = days[0].day;
      let prevMonthYear = Number(data.month) !== 0 ? Number(data.year) : Number(data.year) - 1;
      let prevMonth = Number(data.month) !== 0 ? Number(data.month) - 1 : 11;
      let prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
      let prevMonthDays = [];
      for (let i = 1; i <= prevMonthLastDay; i++) {
        let date: Date = new Date(prevMonthYear, prevMonth, i);
        prevMonthDays.push({
          day: date.getDay(),
          dayIndex: date.getDate(),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          monthName: date.toLocaleDateString('en-US', { month: 'short' }),
          fullDate:
            prevMonthYear +
            '-' +
            (prevMonth + 1).toString().padStart(2, '0') +
            '-' +
            date.getDate().toString().padStart(2, '0'),
          is_current: false,
        });
      }

      if (firstDay > 0) {
        let addToNewMonth = prevMonthDays.slice(-firstDay);
        days = [...addToNewMonth, ...days];
      }

      let groupedDays = this.groupDaysByWeeks(days);

      if (groupedDays[groupedDays.length - 1].length < 7) {
        let nextMonthYear = Number(data.month) !== 11 ? Number(data.year) : Number(data.year) + 1;
        let nextMonth = Number(data.month) !== 11 ? Number(data.month) + 1 : 0;
        let nextMonthLastDay = new Date(nextMonthYear, nextMonth + 1, 0).getDate();
        let nextMonthDays = [];

        for (let i = 1; i <= nextMonthLastDay; i++) {
          let date = new Date(nextMonthYear, nextMonth, i);
          nextMonthDays.push({
            day: date.getDay(),
            dayIndex: date.getDate(),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            monthName: date.toLocaleDateString('en-US', { month: 'short' }),
            fullDate:
              nextMonthYear +
              '-' +
              (nextMonth + 1).toString().padStart(2, '0') +
              '-' +
              date.getDate().toString().padStart(2, '0'),
            is_current: false,
          });
        }

        let sliceNumber = 7 - groupedDays[groupedDays.length - 1].length;
        let addToLastWeek = nextMonthDays.slice(0, sliceNumber);
        groupedDays[groupedDays.length - 1] = [
          ...groupedDays[groupedDays.length - 1],
          ...addToLastWeek,
        ];
      }

      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const day = new Date().getDate().toString().padStart(2, '0');
      let fullDate = year + '-' + month + '-' + day;
      this.currentWeek = groupedDays.findIndex((week: Array<any>) => {
        return week.find((wk) => wk.fullDate == fullDate);
      });
      return {
        group: groupedDays,
        week: data.week,
      };
    })
  );

  groupDaysByWeeks(days: Array<any>) {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }

    return result;
  }

  supplierDelivery = [
    {
      id: 1,
      supplier_name: 'Ram Sharma',
      supplier_products: [
        {
          id: 1,
          product_name: 'Tea',
        },
        {
          id: 2,
          product_name: 'Rice',
        },
        {
          id: 3,
          product_name: 'Eggs',
        },
      ],
      delivery: [
        {
          id: 1,
          delivery_date: '2025-11-09',
          delivery_product: 'Rice',
          delivery_product_amount: 12,
        },
        {
          id: 2,
          delivery_date: '2025-11-15',
          delivery_product: 'Tea',
          delivery_product_amount: 200,
        },
      ],
    },
    {
      id: 2,
      supplier_name: 'Shree Krishna',
      supplier_products: [
        {
          id: 1,
          product_name: 'Daal',
        },
        {
          id: 2,
          product_name: 'Pea',
        },
        {
          id: 3,
          product_name: 'Spices',
        },
      ],
      delivery: [
        {
          id: 1,
          delivery_date: '2025-11-09',
          delivery_product: 'Spices',
          delivery_product_amount: 200,
        },
        {
          id: 2,
          delivery_date: '2025-11-15',
          delivery_product: 'Daal',
          delivery_product_amount: 10,
        },
      ],
    },
    {
      id: 3,
      supplier_name: 'Jay Sean',
      supplier_products: [
        {
          id: 1,
          product_name: 'Noodles',
        },
        {
          id: 2,
          product_name: 'Pasta',
        },
        {
          id: 3,
          product_name: 'Cheese',
        },
        {
          id: 4,
          product_name: 'Tomato Sauce',
        },
      ],
      delivery: [
        {
          id: 1,
          delivery_date: '2025-11-01',
          delivery_product: 'Tomato Sauce',
          delivery_product_amount: 500,
        },
        {
          id: 2,
          delivery_date: '2025-11-05',
          delivery_product: 'Pasta',
          delivery_product_amount: 400,
        },
        {
          id: 3,
          delivery_date: '2025-11-05',
          delivery_product: 'Cheese',
          delivery_product_amount: 150,
        },
        {
          id: 4,
          delivery_date: '2025-12-01',
          delivery_product: 'Cheese',
          delivery_product_amount: 20000,
        },
      ],
    },
  ];

  eventService = inject(Event);

  getTotalWeeks(): Array<number> {
    let weeks = [];
    for (let i = 1; i <= this.totalWeeks; i++) {
      weeks.push(i);
    }
    return weeks;
  }

  onMonthChange(event: any) {
    const [year, month] = event.target.value.split('-');
    const formatted = year + '-' + (month - 1).toString().padStart(2, '0');
    this.currentMonth.next(formatted.toString());
    this.onAnimateTable();
  }

  onWeekChange(event: any) {
    let value = event.target.value == 'null' ? null : event.target.value;
    this.selectedWeek$.next(value);
  }

  onViewChange(event: any) {
    let value = event.target.value;
    this.view.next(value);
    this.onAnimateTable();
  }

  prevView(view: 'month' | 'week') {
    this.onAnimateTable();
    if (view == 'month') {
      let currentMonth = this.currentMonthForm.get('month')?.value;
      if (currentMonth) {
        let [year, month] = currentMonth?.split('-');
        let newYear = Number(month) == 1 ? Number(year) - 1 : Number(year);
        let newMonth = Number(month) == 1 ? 12 : Number(month) - 1;
        let formatted = newYear + '-' + newMonth.toString().padStart(2, '0');
        this.onMonthChange({
          target: {
            value: formatted,
          },
        });
      }
    }

    if (view == 'week') {
      if (this.selectedWeek$.value !== null && this.selectedWeek$.value > 1) {
        this.selectedWeek$.next(this.selectedWeek$.value - 1);
      }
    }
  }
  nextView(view: 'month' | 'week') {
    this.onAnimateTable();
    if (view == 'month') {
      let currentMonth = this.currentMonthForm.get('month')?.value;
      if (currentMonth) {
        let [year, month] = currentMonth?.split('-');
        let newYear = Number(month) == 12 ? Number(year) + 1 : Number(year);
        let newMonth = Number(month) == 12 ? 1 : Number(month) + 1;
        let formatted = newYear + '-' + newMonth.toString().padStart(2, '0');
        this.onMonthChange({
          target: {
            value: formatted,
          },
        });
      }
    }

    if (view == 'week') {
      if (this.selectedWeek$.value !== null && this.selectedWeek$.value < this.totalWeeks) {
        this.selectedWeek$.next(this.selectedWeek$.value + 1);
      }
    }
  }

  getFormattedDate(date: string | undefined | null) {
    if (date == undefined || date == null) return;
    let newDate =
      new Date(date).toLocaleDateString('en-US', { month: 'long' }) +
      ' ' +
      new Date(date).getFullYear();
    return newDate;
  }

  animateTable = signal(false);
  onAnimateTable() {
    this.animateTable.set(true);

    setTimeout(() => {
      this.animateTable.set(false);
    }, 350);
  }

  checkForToday(date: string) {
    return new Date(date).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0);
  }

  gotoToday(view: 'week' | 'month', weeks: Array<any>) {
    if (view == 'month') {
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

      this.onMonthChange({
        target: {
          value: year + '-' + month,
        },
      });
    }

    if (view == 'week') {
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const day = new Date().getDate().toString().padStart(2, '0');
      let fullDate = year + '-' + month + '-' + day;
      let monthFormat = year + '-' + month;
      if (this.currentMonthForm.get('month')?.value !== monthFormat) {
        this.onMonthChange({
          target: {
            value: year + '-' + month,
          },
        });
      }
      this.selectedWeek$.next(this.currentWeek + 1);
    }
  }

  showEvent(event: any, active: any) {
    event.stopPropagation();
    this.showEventOutput.emit(active);
  }

  showAddEventForm(day: any | null, fromCreate: boolean = false){
    this.showAddEventFormOutput.emit({
      day: day,
      fromCreate: fromCreate
    })
  }
}
