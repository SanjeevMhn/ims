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

  @ViewChild('eventDialog') eventDialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('eventTitle') eventTitleRef!: ElementRef<HTMLInputElement>;
  showAddEventForm(day: any) {
    if (this.eventDialogRef) {
      this.eventDialogRef.nativeElement.showModal();
      this.selectedDate = day.fullDate;
      this.eventTitleRef.nativeElement.focus();
    }
  }

  addEventForm = new FormGroup({
    event: new FormControl('', [Validators.required, Validators.minLength(5)]),
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
      this.eventService.addEvent(
        this.addEventForm.get('event')?.value ?? '',
        this.selectedDate ?? ''
      );
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
      fullDate: this.activeEvent.fullDate,
    });
    this.editMode = true;
  }

  closeShowEvent() {
    this.showEventDialogRef.nativeElement.close();
  }
}
