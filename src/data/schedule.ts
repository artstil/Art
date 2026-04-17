import { MissionEvent, EventCategory } from "../types";

export const rawSchedule = [
  {"date": "18", "day": "Saturday", "time": "14:00", "title": "Courtesy Call", "category": "Community"},
  {"date": "18", "day": "Saturday", "time": "18:00", "title": "Holy Rosary", "category": "Spiritual"},

  {"date": "19", "day": "Sunday", "time": "08:00", "title": "H2H Visitation", "category": "Community"},
  {"date": "19", "day": "Sunday", "time": "13:00", "title": "Continuation H2H", "category": "Community"},
  {"date": "19", "day": "Sunday", "time": "15:30", "title": "Mission Talk", "category": "Community"},

  {"date": "20", "day": "Monday", "time": "08:00", "title": "H2H Visitation", "category": "Community"},
  {"date": "20", "day": "Monday", "time": "13:00", "title": "Continuation H2H", "category": "Community"},
  {"date": "20", "day": "Monday", "time": "15:30", "title": "Mission Talk", "category": "Community"},

  {"date": "21", "day": "Tuesday", "time": "08:00", "title": "H2H Visitation / Making of mission cross", "category": "Community"},
  {"date": "21", "day": "Tuesday", "time": "13:00", "title": "Continuation H2H", "category": "Community"},
  {"date": "21", "day": "Tuesday", "time": "15:30", "title": "Mission Talk", "category": "Community"},

  {"date": "22", "day": "Wednesday", "time": "08:00", "title": "Prep. for MOBILE THEATRE, Pre-Jordan, Validation for Baptism", "category": "Activities"},
  {"date": "22", "day": "Wednesday", "time": "13:00", "title": "Continuation for Prep. for Mobile Theatre", "category": "Activities"},
  {"date": "22", "day": "Wednesday", "time": "16:00", "title": "Mass / Baptism", "category": "Sacraments"},
  {"date": "22", "day": "Wednesday", "time": "19:00", "title": "Mobile Theatre", "category": "Activities"},

  {"date": "23", "day": "Thursday", "time": "08:00", "title": "Practices of Choirs, Altar Server and Catechism Classes", "category": "Community"},
  {"date": "23", "day": "Thursday", "time": "13:00", "title": "Pre-Pentecost", "category": "Sacraments"},
  {"date": "23", "day": "Thursday", "time": "15:00", "title": "Prep. sa Confirmation", "category": "Sacraments"},

  {"date": "24", "day": "Friday", "time": "07:00", "title": "Arrival and Final Prep. for Confirmation", "category": "Sacraments"},
  {"date": "24", "day": "Friday", "time": "09:00", "title": "CONFIRMATION", "category": "Sacraments"},
  {"date": "24", "day": "Friday", "time": "15:00", "title": "Practices of Choirs, Altar Servers and Catechism Classes", "category": "Community"},

  {"date": "25", "day": "Saturday", "time": "04:00", "title": "Dawn Rosary", "category": "Spiritual"},
  {"date": "25", "day": "Saturday", "time": "13:00", "title": "Practices of Choirs, Altar Servers and Catechism Classes", "category": "Community"},

  {"date": "26", "day": "Sunday", "time": "08:00", "title": "REST DAY", "category": "Rest"},

  {"date": "27", "day": "Monday", "time": "09:00", "title": "Prep sa Parents and Youth recollection", "category": "Activities"},
  {"date": "27", "day": "Monday", "time": "13:00", "title": "SportsFest Opening", "category": "Activities"},

  {"date": "28", "day": "Tuesday", "time": "08:00", "title": "Basketball", "category": "Activities"},
  {"date": "28", "day": "Tuesday", "time": "13:00", "title": "Volleyball", "category": "Activities"},

  {"date": "29", "day": "Wednesday", "time": "08:00", "title": "Cluster Visitation", "category": "Community"},
  {"date": "29", "day": "Wednesday", "time": "13:00", "title": "Prep. Angels / Practice", "category": "Activities"},
  {"date": "29", "day": "Wednesday", "time": "19:00", "title": "Exhibition Game Malbog", "category": "Activities", "location": "Malbog"},

  {"date": "30", "day": "Thursday", "time": "08:00", "title": "Pre-Cana, Final validation / Cluster visitation", "category": "Sacraments"},
  {"date": "30", "day": "Thursday", "time": "13:00", "title": "Catechism / Prep Flores de Mayo", "category": "Activities"},

  {"date": "01", "day": "Friday", "time": "08:00", "title": "Cluster Visitation", "category": "Community"},
  {"date": "01", "day": "Friday", "time": "13:00", "title": "Final practice / Prep. for Flores de Mayo", "category": "Activities"},
  {"date": "01", "day": "Friday", "time": "15:00", "title": "Opening sa Flores de Mayo", "category": "Activities"},

  {"date": "02", "day": "Saturday", "time": "08:00", "title": "General Prep for wedding / Practice sa couple", "category": "Sacraments"},
  {"date": "02", "day": "Saturday", "time": "13:00", "title": "Continuation for Prep. for wedding", "category": "Sacraments"},
  {"date": "02", "day": "Saturday", "time": "15:00", "title": "Flores de Mayo", "category": "Activities"},
  {"date": "02", "day": "Saturday", "time": "16:00", "title": "Mass wedding", "category": "Sacraments"},
  {"date": "02", "day": "Saturday", "time": "19:00", "title": "Culmination", "category": "Activities"},

  {"date": "03", "day": "Sunday", "time": "08:00", "title": "Planting Of Mission Cross", "category": "Activities"},
  {"date": "03", "day": "Sunday", "time": "10:00", "title": "Departure", "category": "Community"}
];

// Generate daily recurring events for Summer Mission
const dailyEvents: any[] = [];
const startDay = new Date(2026, 3, 19); // April 19
const endDay = new Date(2026, 4, 4);   // May 04

let current = startDay;
while (current <= endDay) {
  const dateStr = String(current.getDate()).padStart(2, '0');
  const dayStr = current.toLocaleDateString('en-US', { weekday: 'long' });
  
  dailyEvents.push({"date": dateStr, "day": dayStr, "time": "05:15", "title": "Morning Prayer", "category": "Spiritual"});
  
  // We avoid directly overwriting specialized masses like Mass Baptism / Wedding so we filter those out later or let them stack.
  // Standard daily:
  dailyEvents.push({"date": dateStr, "day": dayStr, "time": "16:00", "title": "Mass", "category": "Spiritual"});
  dailyEvents.push({"date": dateStr, "day": dayStr, "time": "18:00", "title": "Rosary / Taize", "category": "Spiritual"});
  dailyEvents.push({"date": dateStr, "day": dayStr, "time": "21:00", "title": "Night Prayer", "category": "Spiritual"});
  
  // Next day
  current = new Date(current.getTime() + 86400000);
}

// Combine raw schedule and daily events, removing strict duplicates
const combinedList = [...rawSchedule];

dailyEvents.forEach(dailyEvent => {
  // Prevent strict duplication if a specific Mass or Rosary already exists for that physical slot
  const exists = combinedList.find(e => e.date === dailyEvent.date && e.time === dailyEvent.time);
  if (!exists) {
    combinedList.push(dailyEvent);
  }
});

export const missionEvents: MissionEvent[] = combinedList.map((e) => ({
  id: `${e.date}-${e.time}-${e.title.substring(0,3)}`,
  ...e,
})) as MissionEvent[];

