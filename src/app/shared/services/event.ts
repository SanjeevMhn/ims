import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Event {
  eventList = signal([
    {
      id: 1,
      title: 'Interview at 2pm',
      date: '2025-12-01',
    },
    {
      id: 2,
      title: 'Attend Wedding',
      date: '2025-12-01',
    },
    {
      id: 3,
      title: 'Half Marathon',
      date: '2025-12-05',
    },
  ]);

  getEventList() {
    return this.eventList();
  }

  deleteEvent(eventId: number) {
    this.eventList.update((prev) => prev.filter((pr) => pr.id !== eventId));
  }

  addEvent(title: string, date: string) {
    this.eventList.update((prev) => [
      ...prev,
      {
        id: this.eventList().length + 1,
        title: title,
        date: date,
      },
    ]);
  }

  updateEvent(id: number, update: string) {
    this.eventList.update((currentEvents: any) => {
      return currentEvents.map((ce: any) => {
        if (ce.id == id) {
          return {
            ...ce,
            title: update,
          };
        }
        return ce;
      });
    });
  }
}
