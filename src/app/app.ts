import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, Pencil, Trash2, X } from 'lucide-angular';
import { Calendar } from './features/calendar/calendar';
import { Event } from './shared/services/event';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, LucideAngularModule, Calendar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  
  closeIcon = X;
  editIcon = Pencil;
  deleteIcon = Trash2;

  selectedDate: string | null = null;
  eventService = inject(Event);
  fromCreateButton = false

  @ViewChild('eventDialog') eventDialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('eventTitle') eventTitleRef!: ElementRef<HTMLInputElement>;
  showAddEventForm(data: any) {
    if (this.eventDialogRef) {
      this.fromCreateButton = data.fromCreate;
      this.eventDialogRef.nativeElement.showModal();
      if(!data.fromCreate){
        this.selectedDate = data.day.fullDate;
        this.addEventForm.get('from_date')?.setValue(data.day.fullDate)
      }
      this.eventTitleRef.nativeElement.focus();
    }
  }

  addEventForm = new FormGroup({
    event: new FormControl('', [Validators.required, Validators.minLength(5)]),
    from_date: new FormControl('',[Validators.required]),
    to_date: new FormControl(null)
  });

  resetForm() {
    this.addEventForm.reset();
    this.addEventForm.markAsUntouched();
    this.isSubmitted = false;
  }

  isSubmitted = false;
  editMode = false;

  activeEvent: any | null = null;

  addEvent(event: any) {
    this.isSubmitted = true;
    event.preventDefault();
    if (this.addEventForm.invalid) {
      this.addEventForm.markAllAsTouched();
      return;
    }
    if (!this.editMode) {
      if(this.addEventForm.get('to_date')!.value !== null){
        let getStartDate = this.addEventForm.get('from_date')?.value!
        let getToDate = this.addEventForm.get('to_date')?.value!
        let getDateRanges = this.getDatesBetweenDates(getStartDate, getToDate)
        getDateRanges.forEach(date => {
          this.eventService.addEvent(this.addEventForm.get('event')?.value ?? '',date)
        })
      }else{
        this.eventService.addEvent(
          this.addEventForm.get('event')?.value ?? '',
          this.fromCreateButton ? this.addEventForm.get('date')?.value! : this.selectedDate ?? ''
        );
      }

    } else {
  
      this.eventService.updateEvent(
        this.activeEvent.id,
        this.addEventForm.get('event')?.value ?? ''
      );
    }
    this.editMode = false;
    this.eventDialogRef.nativeElement.close();
    this.resetForm();
  }

  getDatesBetweenDates(startDate:string, endDate:string){
    const dates = []
    let currentDate = new Date(startDate)
    let lastDate = new Date(endDate)

    while(currentDate.getTime() <= lastDate.getTime()){
      const year = currentDate.getUTCFullYear()
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getUTCDate()).padStart(2, "0")

      dates.push(`${year}-${month}-${day}`)

      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    return dates
  }

  closeForm() {
    this.eventDialogRef.nativeElement.close();
    this.resetForm();
  }

  formatDateByMonthAndDayName(date: string) {
    let dateFormat =
      new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) +
      ', ' +
      new Date(date).toLocaleDateString('en-US', { month: 'long' }) +
      ' ' +
      new Date(date).getDate();

    return dateFormat;
  }

  @ViewChild('showEventDialog', { static: false })
  showEventDialogRef!: ElementRef<HTMLDialogElement>;
  showEvent(event: any) {
    let active = event;
    let dateFormat = this.formatDateByMonthAndDayName(active.date);
    this.activeEvent = {
      id: active.id,
      title: active.title,
      date: dateFormat,
      fullDate: active.date,
    };

    this.showEventDialogRef.nativeElement.showModal();
  }

  deleteEvent() {
    this.closeShowEvent();
    this.eventService.deleteEvent(this.activeEvent.id);
  }

  editEvent() {
    this.closeShowEvent();
    this.addEventForm.patchValue({
      event: this.activeEvent.title,
    });
    this.showAddEventForm({
      day: {
        fullDate: this.activeEvent.fullDate,
      },
    });
    this.editMode = true;
  }

  closeShowEvent() {
    this.showEventDialogRef.nativeElement.close();
  }
}
