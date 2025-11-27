import { AsyncPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith, Subject, tap } from 'rxjs';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, AsyncPipe, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ims');

  chevronleft = ChevronLeft;
  chevronright = ChevronRight;

  currentMonthForm = new FormGroup({
    month: new FormControl(''),
  });

  view = new BehaviorSubject<'month' | 'week'>('month');

  viewChange$ = this.view.pipe(
    map((view) => view),
    tap((view) => {
      if (view == 'week') {
        this.selectedWeek$.next(1);
      } else {
        this.selectedWeek$.next(null);
      }
    })
  );

  currentMonthFormatted = new Date().getFullYear() + '-' + new Date().getMonth();
  currentMonth = new BehaviorSubject<string>(this.currentMonthFormatted.toString());
  selectedWeek$ = new BehaviorSubject<number | null>(null);
  totalWeeks = 0;

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
          fullDate:
            data.year +
            '-' +
            (Number(data.month) + 1).toString().padStart(2, '0') +
            '-' +
            date.getDate().toString().padStart(2, '0'),
          is_current: true,
        });
      }

      if (data.week !== null) {
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
            fullDate:
              prevMonthYear +
              '-' +
              (prevMonth + 1).toString().padStart(2, '0') +
              '-' +
              date.getDate().toString().padStart(2, '0'),
            is_current: false,
          });
        }

        let addToNewMonth = prevMonthDays.slice(-firstDay);
        days = [...addToNewMonth, ...days];
        let start = (Number(data.week) - 1) * 7;
        let end = start + 7;
        let weekDays = days.slice(start, end);

        if (weekDays.length < 7) {
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
              fullDate:
                nextMonthYear +
                '-' +
                (nextMonth + 1).toString().padStart(2, '0') +
                '-' +
                date.getDate().toString().padStart(2, '0'),
              is_current: false,
            });
          }

          let sliceNumber = 7 - weekDays.length;
          let addToLastWeek = nextMonthDays.slice(0, sliceNumber);
          weekDays = [...weekDays, ...addToLastWeek];
        }
        return weekDays;
      }
      return days;
    })
  );

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
  }

  onWeekChange(event: any) {
    let value = event.target.value == 'null' ? null : event.target.value;
    this.selectedWeek$.next(value);
  }

  onViewChange(event: any) {
    let value = event.target.value;
    this.view.next(value);
  }

  prevView(view: 'month' | 'week') {
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

    if(view == 'week'){
      if(this.selectedWeek$.value !== null && this.selectedWeek$.value > 1){
        this.selectedWeek$.next(this.selectedWeek$.value - 1)
      }
    }

  }
  nextView(view: 'month' | 'week') {
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

    if(view == 'week'){
      if(this.selectedWeek$.value !== null && this.selectedWeek$.value < this.totalWeeks){
        this.selectedWeek$.next(this.selectedWeek$.value + 1)
      }
    }
  }
}
