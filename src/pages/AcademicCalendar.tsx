import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format, parseISO, isSameMonth, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { campusApi } from '../services/campus-api';

interface CalendarEvent {
  id: number;
  title: string;
  event_date: string;
  event_type: 'exam' | 'holiday' | 'event' | 'deadline';
  description: string;
}

export default function AcademicCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    campusApi.getCalendarEvents().then(setEvents);
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(parseISO(e.event_date), date));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-500 text-white';
      case 'holiday': return 'bg-green-500 text-white';
      case 'deadline': return 'bg-yellow-400 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">ACADEMIC_CALENDAR</h2>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="brutal-card p-0 overflow-hidden">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <button onClick={prevMonth} className="font-mono font-bold hover:text-yellow-400">&lt; PREV</button>
              <h3 className="font-display text-xl font-bold">{format(currentDate, 'MMMM yyyy').toUpperCase()}</h3>
              <button onClick={nextMonth} className="font-mono font-bold hover:text-yellow-400">NEXT &gt;</button>
            </div>
            
            <div className="grid grid-cols-7 border-b-2 border-black">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="p-2 text-center font-mono text-sm font-bold bg-gray-100 border-r border-black last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-white">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div 
                    key={day.toISOString()} 
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[100px] p-2 border-b border-r border-black cursor-pointer transition-colors hover:bg-blue-50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${selectedDate && isSameDay(day, selectedDate) ? 'bg-yellow-100 ring-2 ring-inset ring-black' : ''}`}
                  >
                    <div className="font-mono font-bold text-sm mb-1">{format(day, 'd')}</div>
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div key={event.id} className={`text-[10px] font-mono px-1 py-0.5 truncate border border-black ${getEventTypeColor(event.event_type)}`}>
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="brutal-card bg-yellow-400">
            <h3 className="font-bold font-display text-xl mb-4 border-b-2 border-black pb-2">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'UPCOMING_EVENTS'}
            </h3>
            
            <div className="space-y-4">
              {(selectedDate 
                ? getEventsForDay(selectedDate) 
                : events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 5)
              ).map(event => (
                <div key={event.id} className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-mono px-1 border border-black ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {format(parseISO(event.event_date), 'MMM d')}
                    </span>
                  </div>
                  <h4 className="font-bold font-display">{event.title}</h4>
                  <p className="font-mono text-xs text-gray-600 mt-1">{event.description}</p>
                </div>
              ))}
              
              {selectedDate && getEventsForDay(selectedDate).length === 0 && (
                <p className="font-mono text-sm text-center py-4 opacity-50">NO_EVENTS_SCHEDULED</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
