import { MissionEvent } from '../types';

export function downloadICS(events: MissionEvent[]) {
  // Use CRLF (\r\n) for standard ICS formulation
  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Parish Mission Schedule//EN\r\nCALSCALE:GREGORIAN\r\n";

  events.forEach(event => {
    // Determine the year dynamically or force 2026 based on context
    const year = 2026;
    const day = parseInt(event.date, 10);
    // Over arbitrary day boundary (mid-month transitions)
    const month = day > 15 ? 4 : 5;
    
    // Split time out cleanly
    const [hours, minutes] = event.time.split(':').map(Number);
    
    const pad = (n: number) => String(n).padStart(2, '0');
    
    // Map DTSTART
    const dtStart = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
    
    // Attempt standard +1 hour padding manually for DTEND limits
    let endHours = hours + 1;
    let endMinutes = minutes;
    if (endHours > 23) {
        endHours = 23;
        endMinutes = 59;
    }
    const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(endHours)}${pad(endMinutes)}00`;

    // Unique Identifier standard per event
    const uid = `${event.id}@parishmission2026.local`;

    icsContent += "BEGIN:VEVENT\r\n";
    icsContent += `DTSTART:${dtStart}\r\n`;
    icsContent += `DTEND:${dtEnd}\r\n`;
    icsContent += `UID:${uid}\r\n`;
    icsContent += `SUMMARY:${event.title}\r\n`;
    icsContent += `DESCRIPTION:Event Category: ${event.category}\\nAutomatically added by App.\r\n`;
    
    if (event.location && event.location !== "No specified venue") {
      icsContent += `LOCATION:${event.location}\r\n`;
    }

    const reminderMins = event.reminder !== undefined ? event.reminder : 30;

    if (reminderMins >= 0) {
      icsContent += "BEGIN:VALARM\r\n";
      icsContent += "ACTION:DISPLAY\r\n";
      icsContent += "DESCRIPTION:Reminder\r\n";
      icsContent += `TRIGGER:-PT${reminderMins}M\r\n`;
      icsContent += "END:VALARM\r\n";
    }

    icsContent += "END:VEVENT\r\n";
  });

  icsContent += "END:VCALENDAR\r\n";

  // Deploy to actual physical downloadable ics blob
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Parish_Mission_Schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
