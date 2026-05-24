import { addDays, parseISO, format } from "date-fns";

export function generateCalendarICS(trip: any): boolean {
  if (!trip) {
    console.warn("[calendar-export] No trip data provided");
    return false;
  }

  if (!trip.startDate) {
    console.warn("[calendar-export] Trip has no startDate", trip);
    return false;
  }

  const itinerary: any[] = trip.itinerary ?? [];
  if (itinerary.length === 0) {
    console.warn("[calendar-export] Trip has no itinerary", trip);
    return false;
  }

  try {
    const events: string[] = [];
    const baseDate = parseISO(trip.startDate);
    const tripId = trip.id ?? trip._id ?? Date.now();

    itinerary.forEach((day: any, dIndex: number) => {
      const dayNum = day.day ?? dIndex + 1;
      const currentDayDate = addDays(baseDate, dayNum - 1);
      const dateStr = format(currentDayDate, "yyyyMMdd");

      let timeIndex = 9; // Start at 9am

      const activities: any[] = day.activities ?? day.places ?? [];
      activities.forEach((act: any, aIndex: number) => {
        const uid = `${tripId}-${dayNum}-${aIndex}@safarix.ai`;
        const stamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

        const actHourStr = String(timeIndex).padStart(2, "0");
        const actHourEndStr = String(Math.min(timeIndex + 2, 23)).padStart(2, "0");

        const dtStart = `${dateStr}T${actHourStr}0000`;
        const dtEnd = `${dateStr}T${actHourEndStr}0000`;

        const title = act.title || act.name || "Activity";
        const summary = `Trip: ${title}`;

        // Escape special characters for ICS format
        const descParts = [
          act.description || "",
          "",
          `Cost: ${act.estimatedCost || "N/A"}`,
          `Tip: ${act.tip || "N/A"}`,
        ];
        const description = descParts.join("\\n");

        events.push(
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTAMP:${stamp}`,
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          `SUMMARY:${escapeICS(summary)}`,
          `DESCRIPTION:${escapeICS(description)}`,
          `LOCATION:${escapeICS(`${title}, ${trip.destination}`)}`,
          "END:VEVENT"
        );

        timeIndex += 3;
      });
    });

    if (events.length === 0) {
      console.warn("[calendar-export] No events generated from itinerary");
      return false;
    }

    const calendarData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Safarix AI Travel Planner//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${trip.destination} Trip`,
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([calendarData], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = (trip.destination || "Trip").replace(/[^a-zA-Z0-9]/g, "_");
    link.setAttribute("download", `Safarix_${safeName}_Itinerary.ics`);
    document.body.appendChild(link);
    link.click();
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (err) {
    console.error("[calendar-export] Error generating ICS:", err);
    return false;
  }
}

/** Escape special characters for ICS format */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
