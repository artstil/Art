import { useState, useMemo, useEffect, useRef } from 'react';
import { missionEvents } from './data/schedule';
import { EvaluationData, EventCategory, MissionEvent } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { cn } from './lib/utils';
import { Play, Pause, X, Calendar, Bell, Plus, ChevronLeft, ChevronRight, LayoutList, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadICS } from './lib/calendar';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth } from 'date-fns';

const categoryClasses: Record<EventCategory, string> = {
  Spiritual: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Community: 'bg-rose-50 text-rose-700 border-rose-200',
  Sacraments: 'bg-sky-50 text-sky-700 border-sky-200',
  Activities: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Evaluation: 'bg-amber-50 text-amber-700 border-amber-200',
  Rest: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function App() {
  const [evaluations, setEvaluations] = useLocalStorage<Record<string, EvaluationData>>('mission-evaluations', {});
  const [customEvents, setCustomEvents] = useLocalStorage<MissionEvent[]>('mission-custom-events', []);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [evaluationText, setEvaluationText] = useState('');
  const [evaluationEventId, setEvaluationEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<MissionEvent>>({
    date: '18',
    time: '12:00',
    title: '',
    category: 'Community',
    location: ''
  });

  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 3, 1)); // April 2026

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Time simulation state
  const [simDate, setSimDate] = useState('18');
  const [simTimeHrs, setSimTimeHrs] = useState(14);
  const [simTimeMins, setSimTimeMins] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [triggeredAlarms, setTriggeredAlarms] = useState<string[]>([]);
  const [activeAlarmMessage, setActiveAlarmMessage] = useState<{title: string, time: string, location?: string, reminderMins: number} | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<MissionEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'All'>('All');

  const activeEventRef = useRef<HTMLDivElement>(null);

  const resolveSortDate = (d: string) => {
      const num = parseInt(d, 10);
      return num > 15 ? `04-${String(num).padStart(2, '0')}` : `05-${String(num).padStart(2, '0')}`;
  };

  const allEvents = useMemo(() => {
    const combined = [...missionEvents, ...customEvents];
    return combined.sort((a, b) => {
      const aSort = resolveSortDate(a.date) + a.time;
      const bSort = resolveSortDate(b.date) + b.time;
      return aSort.localeCompare(bSort);
    });
  }, [customEvents]);

  const filteredAllEvents = useMemo(() => {
    if (filterCategory === 'All') return allEvents;
    return allEvents.filter(e => e.category === filterCategory);
  }, [allEvents, filterCategory]);

  const eventsByDate = useMemo<Record<string, MissionEvent[]>>(() => {
    const grouped: Record<string, MissionEvent[]> = {};
    filteredAllEvents.forEach(evt => {
      if (!grouped[evt.date]) grouped[evt.date] = [];
      grouped[evt.date].push(evt);
    });
    return grouped;
  }, [filteredAllEvents]);

  // Effect to check alarm triggered by time simulation against ALL events
  useEffect(() => {
    const simTotalMins = simTimeHrs * 60 + simTimeMins;
    
    // Alarms must check against the unfiltered list
    allEvents.filter(e => e.date === simDate).forEach(event => {
      const [eHrs, eMins] = event.time.split(':').map(Number);
      const eventTotalMins = eHrs * 60 + eMins;

      const reminderMins = event.reminder !== undefined ? event.reminder : 30;

      // Checking if exact trigger minus
      if (eventTotalMins - simTotalMins === reminderMins) {
        if (!triggeredAlarms.includes(event.id)) {
          setTriggeredAlarms(prev => [...prev, event.id]);
          setActiveAlarmMessage({
            title: event.title,
            time: event.time,
            location: event.location,
            reminderMins: reminderMins,
          });
          try {
            // Short ping/bell sound to simulate 'alarm' app
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio autoplay blocked', e));
          } catch(e) {}
        }
      }
    });
  }, [simDate, simTimeHrs, simTimeMins, eventsByDate, triggeredAlarms]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTimeMins((prevMins) => {
        if (prevMins >= 59) {
          setSimTimeHrs((prevHrs) => {
            if (prevHrs >= 23) {
              setSimDate((prevDate) => {
                const num = parseInt(prevDate);
                if (num === 30) return '01';
                if (num === 3) return '03'; // cap at '03'
                return String(num + 1).padStart(2, '0');
              });
              return 0;
            }
            return prevHrs + 1;
          });
          return 0;
        }
        return prevMins + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentSimTimeFormatted = `${String(simTimeHrs).padStart(2, '0')}:${String(simTimeMins).padStart(2, '0')}`;

  const determineIsActive = (eventTime: string, nextEventTime: string | null) => {
    return eventTime <= currentSimTimeFormatted && (!nextEventTime || currentSimTimeFormatted < nextEventTime);
  };

  const handleOpenEvaluation = (eventId: string, existingContent?: string) => {
    setEvaluationEventId(eventId);
    setEvaluationText(existingContent || '');
    setIsEvaluationOpen(true);
  };

  const saveEvaluation = () => {
    if (!evaluationEventId) return;
    if (evaluationText.trim()) {
      setEvaluations((prev) => ({
        ...prev,
        [evaluationEventId]: {
          id: evaluationEventId,
          content: evaluationText.trim(),
          createdAt: Date.now(),
        }
      }));
    } else {
      const newEvals = {...evaluations};
      delete newEvals[evaluationEventId];
      setEvaluations(newEvals);
    }
    setIsEvaluationOpen(false);
  };

  const isCurrentDateActive = (date: string) => date === simDate;
  const activeEventList = eventsByDate[simDate] || [];
  const currentActiveEvent = activeEventList.find((evt, idx) => 
    determineIsActive(evt.time, activeEventList[idx + 1]?.time || null)
  );

  const getWeek = (date: string) => {
    const d = parseInt(date, 10);
    if (d >= 18 && d <= 24) return 1;
    if ((d >= 25 && d <= 30) || d === 1) return 2;
    return 3;
  };

  const getMonth = (date: string) => {
    return parseInt(date, 10) > 15 ? 'April' : 'May';
  };

  const formatTime12Hour = (time24: string) => {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const saveNewEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.category) return;
    
    const eventsToSave: MissionEvent[] = [];
    const baseDateStr = newEvent.date;
    const baseMonth = getMonth(baseDateStr) === 'April' ? 3 : 4;
    const startDate = new Date(2026, baseMonth, parseInt(baseDateStr, 10));
    
    let occurrences = 1;
    if (newEvent.recurrence === 'daily') occurrences = 14; 
    else if (newEvent.recurrence === 'weekly') occurrences = 4;
    else if (newEvent.recurrence === 'monthly') occurrences = 3;

    for (let i = 0; i < occurrences; i++) {
        let currentDate = new Date(startDate);
        if (newEvent.recurrence === 'daily') {
            currentDate.setDate(startDate.getDate() + i);
        } else if (newEvent.recurrence === 'weekly') {
            currentDate.setDate(startDate.getDate() + (i * 7));
        } else if (newEvent.recurrence === 'monthly') {
            currentDate.setMonth(startDate.getMonth() + i);
        }

        const dateStr = format(currentDate, 'dd');
        // fallback robust logical day resolution
        const customDayMatch = eventsByDate[dateStr]?.[0]?.day || format(currentDate, 'EEEE');

        const finalEvent: MissionEvent = {
            id: `custom-${Date.now()}-${i}`,
            date: dateStr,
            day: customDayMatch, 
            time: newEvent.time,
            title: newEvent.title,
            category: newEvent.category as EventCategory,
            location: newEvent.location || undefined,
            reminder: newEvent.reminder !== undefined ? newEvent.reminder : 30,
            recurrence: newEvent.recurrence
        };
        eventsToSave.push(finalEvent);
    }

    setCustomEvents(prev => [...prev, ...eventsToSave]);
    setIsAddEventOpen(false);
    setNewEvent({
      date: simDate,
      time: '12:00',
      title: '',
      category: 'Community',
      location: '',
      reminder: 30,
      recurrence: 'none'
    });
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-theme-border flex flex-col h-full lg:mr-8 mb-24 lg:mb-0 max-w-full overflow-y-auto min-h-[500px]">
         <div className="flex justify-between items-center mb-6">
           <div className="flex gap-2">
             <button onClick={prevMonth} aria-label="Previous month" className="p-2.5 md:p-3 bg-theme-bg rounded-xl hover:bg-theme-border border-2 border-theme-border transition-colors active:scale-95 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary"><ChevronLeft className="w-5 h-5"/></button>
             <button onClick={nextMonth} aria-label="Next month" className="p-2.5 md:p-3 bg-theme-bg rounded-xl hover:bg-theme-border border-2 border-theme-border transition-colors active:scale-95 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary"><ChevronRight className="w-5 h-5"/></button>
           </div>
           
           <h2 className="text-lg md:text-2xl font-display font-bold text-theme-text">{format(currentMonth, 'MMMM yyyy')}</h2>
           <button 
             onClick={() => {
               const now = new Date();
               setCurrentMonth(now);
               const dayStr = format(now, 'dd');
               if (eventsByDate[dayStr]) {
                 setSimDate(dayStr);
               }
             }} 
             className="px-3 md:px-4 py-2 bg-theme-primary/10 text-theme-primary border-2 border-theme-primary/30 font-bold rounded-xl active:scale-95 transition-all text-xs md:text-sm whitespace-nowrap hover:bg-theme-primary hover:text-white"
           >
             Go to Today
           </button>
         </div>
         <div className="grid grid-cols-7 gap-2 mb-3">
           {weekDays.map(d => <div key={d} className="text-center font-bold text-[10px] md:text-xs text-theme-text-light uppercase tracking-wider">{d}</div>)}
         </div>
         <div className="grid grid-cols-7 gap-2 md:gap-3 flex-1 auto-rows-fr">
           {days.map(day => {
              const dayStr = format(day, 'dd');
              const monthStr = format(day, 'MMMM');

              const cellEvents = filteredAllEvents.filter(e => {
                 return e.date === dayStr && getMonth(e.date) === monthStr;
              });

               const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = simDate === dayStr && getMonth(simDate) === monthStr;
              const isRealToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

              return (
                <div
                  key={day.toString()}
                  onClick={() => {
                    setSimDate(dayStr);
                    setViewMode('timeline');
                  }}
                  className={cn(
                    "rounded-[1rem] p-1.5 md:p-2 border-2 cursor-pointer transition-all flex flex-col justify-start items-center relative overflow-hidden active:scale-95",
                    !isCurrentMonth ? "opacity-30 bg-theme-bg border-transparent" :
                    isSelected ? "bg-theme-primary/10 border-theme-primary shadow-md" : "bg-white border-theme-border hover:border-theme-primary/50",
                    isRealToday && !isSelected && "bg-sky-50 border-sky-300",
                    "min-h-[70px] md:min-h-[100px]"
                  )}
                >
                   <span className={cn(
                     "text-xs md:text-sm font-bold mb-1 md:mb-2 w-6 h-6 flex items-center justify-center rounded-full leading-none", 
                     isSelected ? "bg-theme-primary text-white" : 
                     isRealToday ? "bg-sky-500 text-white" : "text-theme-text"
                   )}>
                     {format(day, 'd')}
                   </span>
                   <div className="flex flex-wrap gap-1 justify-center w-full mt-auto pb-1 px-0.5">
                     {cellEvents.map((e, idx) => {
                        if (idx > 3) return null;
                        const bgMatch = categoryClasses[e.category]?.match(/bg-([a-z]+)-50\b/);
                        const baseCatColor = bgMatch ? `bg-${bgMatch[1]}-500` : 'bg-slate-400'; 
                        return (
                          <div key={e.id} className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", baseCatColor)} title={e.title}/>
                        )
                     })}
                     {cellEvents.length > 4 && <span className="text-[10px] font-bold text-theme-text-light leading-none">+{cellEvents.length - 4}</span>}
                   </div>
                </div>
              )
           })}
         </div>
      </div>
    )
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-theme-bg text-theme-text selection:bg-theme-accent/30 font-sans">
      {/* In-App Alarm Popup */}
      <AnimatePresence>
        {activeAlarmMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-0 w-full flex justify-center z-[100] px-4 pointer-events-none"
          >
             <div className="bg-theme-accent text-white p-6 rounded-[2rem] shadow-2xl border-[4px] border-white flex flex-col items-center min-w-[320px] pointer-events-auto">
               <span className="text-4xl mb-2"><Bell className="w-10 h-10 animate-bounce" /></span>
               <h3 className="font-display font-bold text-xl mb-1 text-center">
                 {activeAlarmMessage.reminderMins === 0 ? "Event Starting Now!" : `Event in ${activeAlarmMessage.reminderMins === 60 ? '1 Hour' : activeAlarmMessage.reminderMins === 120 ? '2 Hours' : activeAlarmMessage.reminderMins + ' Mins'}!`}
               </h3>
               <p className="text-center font-extrabold text-white text-xl px-2">"{activeAlarmMessage.title}"</p>
               <p className="text-sm font-bold opacity-90 mt-1">Starts at {formatTime12Hour(activeAlarmMessage.time)}</p>
               {activeAlarmMessage.location && (
                 <div className="text-sm font-bold bg-white/20 rounded-full px-4 py-1 mt-3 flex items-center gap-2">
                   📍 {activeAlarmMessage.location}
                 </div>
               )}
               <button
                 onClick={() => setActiveAlarmMessage(null)}
                 className="mt-5 bg-white text-theme-accent font-extrabold px-8 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all w-full"
               >
                 DISMISS ALARM
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-[260px] border-r-4 border-theme-border hidden md:flex flex-col p-6 shrink-0 z-10 bg-theme-bg relative">
        <div className="text-[22px] font-display font-bold tracking-wide text-theme-accent mb-10 flex items-center gap-2">
          <span className="text-3xl">🗓️</span> Calendarium
        </div>

        <div className="mb-8 font-bold">
          <div className="text-[12px] uppercase tracking-wider text-theme-text-light mb-4 font-sans font-extrabold">
            Mission Schedule
          </div>
          <div className={cn("py-3 px-4 rounded-2xl cursor-pointer flex items-center mb-2 transition-all", getWeek(simDate) === 1 ? "bg-theme-accent text-white shadow-md scale-105" : "text-theme-text-light hover:bg-theme-surface-alt")}>
            <div className={cn("w-2 h-2 rounded-full mr-3", getWeek(simDate) === 1 ? "bg-white" : "bg-theme-border")} />
            Week 1: Orientation
          </div>
          <div className={cn("py-3 px-4 rounded-2xl cursor-pointer flex items-center mb-2 transition-all", getWeek(simDate) === 2 ? "bg-theme-primary text-white shadow-md scale-105" : "text-theme-text-light hover:bg-theme-surface-alt")}>
            <div className={cn("w-2 h-2 rounded-full mr-3", getWeek(simDate) === 2 ? "bg-white" : "bg-theme-border")} />
            Week 2: Sacraments
          </div>
          <div className={cn("py-3 px-4 rounded-2xl cursor-pointer flex items-center transition-all", getWeek(simDate) === 3 ? "bg-indigo-500 text-white shadow-md scale-105" : "text-theme-text-light hover:bg-theme-surface-alt")}>
            <div className={cn("w-2 h-2 rounded-full mr-3", getWeek(simDate) === 3 ? "bg-white" : "bg-theme-border")} />
            Week 3: Departure
          </div>
        </div>

        <div className="mb-8">
          <div className="text-[12px] uppercase tracking-wider text-theme-text-light mb-3 font-extrabold">
            Sim Controls & Sync
          </div>
          <div className="flex flex-col gap-3 p-4 bg-theme-surface-alt border-4 border-theme-border rounded-3xl text-sm font-bold">
            <div className="flex flex-row gap-2 mb-1">
              <button
                 onClick={() => setIsAddEventOpen(true)}
                 className="flex-1 py-2.5 rounded-xl bg-theme-primary text-white font-bold hover:translate-y-0.5 shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                 <Plus className="w-4 h-4 text-white" /> Add Event
              </button>
              <button
                 onClick={() => downloadICS(allEvents)}
                 className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:translate-y-0.5 shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                 <Calendar className="w-4 h-4 text-white" /> Sync Cal
              </button>
            </div>
            <div className="w-full h-[3px] bg-theme-border rounded-full" />
            <div className="text-[10px] text-center uppercase tracking-wider text-theme-text-light font-extrabold mt-1">
              Test In-App Alarms Below (Auto-reminds 30m before events)
            </div>
            <div className="flex justify-between items-center text-theme-text mt-1">
              <span>DATE</span>
              <select 
                value={simDate} 
                onChange={(e) => setSimDate(e.target.value)}
                className="bg-white px-2 py-1 rounded-xl border-2 border-theme-border text-theme-accent focus:ring-0 cursor-pointer outline-none w-24"
              >
                {Object.keys(eventsByDate).map(date => (
                  <option key={date} value={date}>{getMonth(date)} {date}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center text-theme-text">
              <span>TIME</span>
              <input 
                type="time" 
                value={currentSimTimeFormatted} 
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  setSimTimeHrs(h);
                  setSimTimeMins(m);
                }}
                className="bg-white px-2 py-1 rounded-xl border-2 border-theme-border text-theme-primary focus:ring-0 cursor-pointer outline-none w-24"
              />
            </div>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="mt-2 py-2 rounded-xl border-b-4 border-l-2 border-r-2 border-t-2 border-theme-primary bg-theme-primary/10 text-theme-primary font-bold hover:translate-y-0.5 hover:border-b-2 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "PAUSE" : "PLAY AUTO"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 flex flex-col overflow-y-auto relative bg-theme-surface">
        <header className="mb-6 lg:mb-10 lg:pl-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-theme-text tracking-tight mb-2">
                {eventsByDate[simDate]?.[0]?.day}, {getMonth(simDate)} {simDate}
              </div>
              <div className="text-lg text-theme-text-light font-medium">
                Parish Mission Schedule 🌟
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <button
                 onClick={() => setIsAddEventOpen(true)}
                 className="md:hidden py-3 px-4 rounded-xl bg-theme-primary text-white font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                 <Plus className="w-5 h-5" /> Add Event
              </button>
              <button
                 onClick={() => downloadICS(allEvents)}
                 className="md:hidden py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                 <Calendar className="w-5 h-5" /> Sync Calendar
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-2 self-start w-full md:w-auto">
            <div className="flex items-center gap-2 bg-theme-bg p-1.5 rounded-2xl border-2 border-theme-border md:w-[360px]">
              <button
                 onClick={() => setViewMode('timeline')}
                 className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2", viewMode === 'timeline' ? "bg-white text-theme-text shadow-sm" : "text-theme-text-light hover:text-theme-text")}
              >
                 <LayoutList className="w-4 h-4"/> Timeline view
              </button>
              <button
                 onClick={() => setViewMode('calendar')}
                 className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2", viewMode === 'calendar' ? "bg-white text-theme-text shadow-sm" : "text-theme-text-light hover:text-theme-text")}
              >
                 <CalendarDays className="w-4 h-4"/> Calendar View
              </button>
            </div>
            <div className="flex bg-theme-bg p-1.5 rounded-2xl border-2 border-theme-border flex-1 md:flex-initial">
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value as any)}
                className="w-full md:w-48 bg-transparent text-sm font-bold text-theme-text focus:outline-none px-3 py-1 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {Object.keys(categoryClasses).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Mobile Sim Time Controls */}
        {viewMode === 'timeline' && (
          <div className="md:hidden flex items-center justify-between bg-theme-bg border-4 border-theme-border rounded-2xl p-4 mb-6 shadow-sm mx-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-theme-text-light tracking-wider">Simulated Time</span>
              <span className="text-xl font-display font-bold text-theme-primary">{formatTime12Hour(currentSimTimeFormatted)}</span>
            </div>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
              className="py-2.5 px-6 rounded-xl border-b-4 border-t-2 border-x-2 border-theme-primary bg-white text-theme-primary font-bold active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>
        )}

        <div className="relative flex-1 lg:pl-10 flex flex-col">
          {viewMode === 'calendar' ? renderCalendar() : (
            <>
              {/* Main timeline vert line */}
              <div className="absolute left-[34px] md:left-[60px] top-0 bottom-0 w-[4px] border-l-4 border-dashed border-theme-border z-0"></div>
              
              <div className="relative z-10 flex flex-col pb-24">
            {Object.entries(eventsByDate).map(([date, _events]) => {
              const events = _events as MissionEvent[];
              const isDateActive = isCurrentDateActive(date);

              if (!isDateActive) return null;

              return (
                <div key={date} className="space-y-8">
                  {events.map((event, idx) => {
                    const nextEvent = events[idx + 1];
                    const isActive = isDateActive && determineIsActive(event.time, nextEvent?.time || null);
                    const isPast = isDateActive && event.time < currentSimTimeFormatted;

                    return (
                      <motion.div 
                        key={event.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        ref={isActive ? activeEventRef : null}
                        className={cn(
                          "flex items-center relative transition-all duration-500",
                          isActive ? "z-20" : (isPast ? "opacity-60" : "opacity-100")
                        )}
                      >
                        {/* Time */}
                        <div className={cn(
                          "w-[50px] md:w-[65px] font-bold text-[11px] md:text-[13px] text-right shrink-0",
                          isActive ? "text-theme-primary" : "text-theme-text-light"
                        )}>
                          {formatTime12Hour(event.time)}
                        </div>

                        {/* Marker */}
                        <motion.div 
                          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={cn(
                            "rounded-full border-4 mx-2 md:mx-[16px] z-10 shrink-0 transition-all duration-300",
                            isActive 
                              ? "w-6 h-6 bg-theme-primary border-white shadow-[0_0_0_4px_var(--color-theme-primary)]" 
                              : "w-4 h-4 bg-theme-surface border-theme-border"
                          )}
                        />

                        {/* Event Card */}
                        <div 
                          onClick={() => setSelectedEventDetails(event)}
                          className={cn(
                          "flex-1 p-3 md:p-5 rounded-3xl border-2 flex flex-col md:flex-row md:items-center justify-between transition-all duration-300 cursor-pointer hover:border-theme-primary/50",
                          isActive 
                            ? "bg-white border-theme-primary shadow-[0_12px_30px_-5px_rgba(14,165,233,0.2)] md:scale-105" 
                            : "bg-theme-bg border-theme-border shadow-sm",
                          event.category === 'Rest' && "border-dashed"
                        )}>
                          <div className={cn("text-[14px] md:text-[18px] font-bold", isActive ? "text-theme-text" : "text-theme-text")}>
                            {event.title}
                          </div>
                          <div className={cn(
                            "mt-2 md:mt-0 text-[10px] md:text-[12px] px-3 py-1.5 rounded-full uppercase font-bold border-2 shrink-0 self-start md:self-auto",
                            categoryClasses[event.category]
                          )}>
                            {event.category}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
            </>
          )}
        </div>
      </main>

      {/* Side Panel (Desktop only) */}
      <aside className="w-[340px] p-6 hidden lg:flex flex-col gap-6 shrink-0 bg-theme-bg border-l-4 border-theme-border overflow-y-auto">
        
        {/* Live Now Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-theme-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-theme-accent/10 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center gap-2 text-theme-accent text-[13px] font-bold mb-3 uppercase tracking-wider bg-theme-accent/10 w-fit px-3 py-1 rounded-full">
            <motion.div animate={{scale:[1,1.5,1]}} transition={{repeat:Infinity, duration:1.5}} className="w-2 h-2 bg-theme-accent rounded-full" />
            LIVE NOW
          </div>
          <div className="text-[20px] font-display font-bold text-theme-text leading-tight mb-2 relative z-10">
            {currentActiveEvent?.title || "Free Time / Transition"}
          </div>
          <div className="text-[14px] text-theme-text-light font-medium bg-theme-bg mt-4 p-3 rounded-2xl flex items-center gap-2">
            📍 {currentActiveEvent?.location || "No specified venue"}
          </div>
        </div>

        {/* Evaluation Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-theme-border flex flex-col flex-1 max-h-[450px]">
          <div className="text-[16px] font-display font-bold text-theme-text mb-2 flex justify-between items-center">
            <span>📝 Daily Diary</span>
            <span className="text-sm font-sans bg-theme-surface-alt px-2 py-1 rounded-lg text-theme-text-light">{getMonth(simDate)} {simDate}</span>
          </div>
          <p className="text-[13px] text-theme-text-light mb-4 font-medium">
            Jot down memories, reflections, or fun moments from today!
          </p>
          
          <textarea
            value={evaluationText}
            onChange={(e) => setEvaluationText(e.target.value)}
            placeholder={evaluations[`${simDate}-eval`]?.content ? "Edit your diary entry..." : "Dear diary..."}
            className="w-full flex-1 min-h-[140px] bg-theme-bg border-4 border-theme-border rounded-2xl p-4 text-theme-text text-[14px] resize-none focus:outline-none focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/20 transition-all font-medium"
            onFocus={() => {
              if (evaluationEventId !== `${simDate}-eval`) {
                setEvaluationEventId(`${simDate}-eval`);
                setEvaluationText(evaluations[`${simDate}-eval`]?.content || '');
              }
            }}
          />
          <div className="mt-4 flex justify-between items-end">
            <span className="text-[11px] text-theme-text-light font-bold">* Markdown ready</span>
            <button 
              onClick={() => {
                setEvaluationEventId(`${simDate}-eval`);
                saveEvaluation();
              }}
              className="bg-theme-primary text-white border-b-4 border-r-4 border-sky-600 px-5 py-2.5 rounded-2xl font-bold hover:translate-y-1 hover:border-b-0 hover:border-r-0 active:translate-y-2 transition-all"
            >
              SAVE DIARY
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Action Button (Mobile evaluation trigger) */}
      <button 
        onClick={() => handleOpenEvaluation(`${simDate}-eval`, evaluations[`${simDate}-eval`]?.content)}
        aria-label="Open daily diary"
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-theme-accent text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.4)] border-4 border-white z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      {/* Mobile Evaluation Modal */}
      <AnimatePresence>
        {isEvaluationOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-theme-text/40 backdrop-blur-sm"
              onClick={() => setIsEvaluationOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{type: "spring", stiffness: 300, damping: 25}}
              className="relative w-full max-w-lg bg-white border-4 border-theme-border shadow-2xl rounded-[2rem] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b-2 border-theme-bg bg-theme-bg">
                <h2 className="text-lg font-display font-bold text-theme-text flex items-center gap-2">
                  <span className="text-xl">📝</span> Daily Diary
                </h2>
                <button onClick={() => setIsEvaluationOpen(false)} aria-label="Close daily diary" className="bg-white rounded-full p-2 text-theme-text-light hover:text-theme-accent hover:bg-theme-border transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary">
                  <X className="w-5 h-5 stroke-2" />
                </button>
              </div>
              
              <div className="p-5 flex-grow bg-white">
                <textarea
                  value={evaluationText}
                  onChange={(e) => setEvaluationText(e.target.value)}
                  placeholder="Record your thoughts for today..."
                  className="w-full h-48 bg-theme-bg border-4 border-theme-border rounded-2xl p-4 text-theme-text text-base font-medium focus:outline-none focus:border-theme-accent resize-none"
                  autoFocus
                />
              </div>

              <div className="p-5 border-t-2 border-theme-bg bg-theme-bg flex justify-end gap-3">
                <button 
                  onClick={saveEvaluation}
                  className="w-full py-3 rounded-2xl font-bold text-md bg-theme-accent text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] active:scale-95 transition-transform"
                >
                  SAVE ENTRY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAddEventOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-theme-text/40 backdrop-blur-sm"
              onClick={() => setIsAddEventOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{type: "spring", stiffness: 300, damping: 25}}
              className="relative w-full max-w-lg bg-white border-4 border-theme-border shadow-2xl rounded-[2rem] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b-2 border-theme-bg bg-theme-bg">
                <h2 className="text-lg font-display font-bold text-theme-text flex items-center gap-2">
                  <span className="text-xl">✨</span> Create New Event
                </h2>
                <button onClick={() => setIsAddEventOpen(false)} aria-label="Close add event" className="bg-white rounded-full p-2 text-theme-text-light hover:text-theme-accent hover:bg-theme-border transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary">
                  <X className="w-5 h-5 stroke-2" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-4 bg-white overflow-y-auto max-h-[60vh]">
                <div>
                  <label className="block text-sm font-bold text-theme-text-light mb-1">Event Title *</label>
                  <input 
                    type="text" 
                    value={newEvent.title} 
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                    placeholder="E.g., Special Choir Practice"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="block text-sm font-bold text-theme-text-light mb-1">Date *</label>
                     <select 
                       value={newEvent.date}
                       onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                       className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                     >
                        {Array.from(new Set(missionEvents.map(e => e.date))).map(d => (
                           <option key={d} value={d}>{getMonth(d)} {d}</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex-1">
                     <label className="block text-sm font-bold text-theme-text-light mb-1">Time *</label>
                     <input 
                       type="time" 
                       value={newEvent.time}
                       onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                       className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                     />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-theme-text-light mb-1">Category *</label>
                  <select 
                    value={newEvent.category} 
                    onChange={e => setNewEvent({...newEvent, category: e.target.value as EventCategory})}
                    className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                  >
                    {Object.keys(categoryClasses).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-theme-text-light mb-1">Alert Reminder *</label>
                  <select 
                    value={newEvent.reminder !== undefined ? newEvent.reminder : 30} 
                    onChange={e => setNewEvent({...newEvent, reminder: parseInt(e.target.value, 10)})}
                    className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                  >
                    <option value={0}>On event start</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={120}>2 hours before</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-theme-text-light mb-1">Recurrence *</label>
                  <select 
                    value={newEvent.recurrence || 'none'} 
                    onChange={e => setNewEvent({...newEvent, recurrence: e.target.value as any})}
                    className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily (Next 14 Days)</option>
                    <option value="weekly">Weekly (Next 4 Weeks)</option>
                    <option value="monthly">Monthly (Next 3 Months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-theme-text-light mb-1">Location (Optional)</label>
                  <input 
                    type="text" 
                    value={newEvent.location} 
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full bg-theme-bg border-4 border-theme-border rounded-xl p-3 text-theme-text text-base font-medium focus:outline-none focus:border-theme-primary transition-colors"
                    placeholder="E.g., Main Church Area"
                  />
                </div>
              </div>

              <div className="p-5 border-t-2 border-theme-bg bg-theme-bg flex justify-end gap-3">
                <button 
                  onClick={saveNewEvent}
                  disabled={!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.category}
                  className="w-full py-3 rounded-2xl font-bold text-md bg-theme-primary text-white shadow-[0_4px_15px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-transform"
                >
                  SAVE EVENT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedEventDetails && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-theme-text/40 backdrop-blur-sm"
              onClick={() => setSelectedEventDetails(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{type: "spring", stiffness: 300, damping: 25}}
              className="relative w-full max-w-sm bg-white border-4 border-theme-border shadow-2xl rounded-[2rem] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b-2 border-theme-bg bg-theme-bg">
                <h2 className="text-lg font-display font-bold text-theme-text flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Event Details
                </h2>
                <button onClick={() => setSelectedEventDetails(null)} aria-label="Close event details" className="bg-white rounded-full p-2 text-theme-text-light hover:text-theme-accent hover:bg-theme-border transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-theme-primary">
                  <X className="w-5 h-5 stroke-2" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-5 bg-white">
                <div>
                  <h3 className="font-display font-black text-2xl text-theme-text leading-tight mb-2">
                    {selectedEventDetails.title}
                  </h3>
                  <div className={cn(
                    "inline-block px-3 py-1.5 rounded-full uppercase font-bold text-xs border-2 shadow-sm",
                    categoryClasses[selectedEventDetails.category]
                  )}>
                    {selectedEventDetails.category}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-theme-bg p-3 rounded-2xl border-2 border-theme-border">
                    <span className="block text-[10px] font-black uppercase text-theme-text-light tracking-wider mb-1">Time</span>
                    <span className="font-bold text-theme-text text-sm">{formatTime12Hour(selectedEventDetails.time)}</span>
                  </div>
                  <div className="bg-theme-bg p-3 rounded-2xl border-2 border-theme-border">
                    <span className="block text-[10px] font-black uppercase text-theme-text-light tracking-wider mb-1">Date</span>
                    <span className="font-bold text-theme-text text-sm flex flex-col pt-0.5">
                       <span>{getMonth(selectedEventDetails.date)} {selectedEventDetails.date}</span>
                       {selectedEventDetails.recurrence && selectedEventDetails.recurrence !== 'none' && (
                         <span className="text-[10px] text-theme-primary/80 mt-1 uppercase">↻ {selectedEventDetails.recurrence}</span>
                       )}
                    </span>
                  </div>
                </div>

                {selectedEventDetails.location && (
                  <div className="bg-theme-bg p-3 rounded-2xl border-2 border-theme-border">
                    <span className="block text-[10px] font-black uppercase text-theme-text-light tracking-wider mb-1">Location</span>
                    <span className="font-bold text-theme-text text-sm flex items-start gap-2">
                      📍 {selectedEventDetails.location}
                    </span>
                  </div>
                )}
                
                <div className="bg-indigo-50/50 p-3 rounded-2xl border-2 border-indigo-100 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-indigo-400 shrink-0"/>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-indigo-400 tracking-wider">Alert Config</span>
                    <span className="font-bold text-indigo-700 text-xs">
                      {selectedEventDetails.reminder === 0 ? "Alerts exactly on start time" : `Notifying ${selectedEventDetails.reminder !== undefined ? selectedEventDetails.reminder : 30} minutes prior`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
