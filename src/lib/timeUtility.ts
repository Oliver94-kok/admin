import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export class TimeUtils {
  /**
   * Convert time string to hours and minutes
   * @param timeString Format: "18:00" for 6 PM, "05:00" for 5 AM
   */
  static parseTimeString(timeString: string): {
    hours: number;
    minutes: number;
  } {
    const [hoursString, minutesString] = timeString.split(":");
    const hours = parseInt(hoursString);
    const minutes = parseInt(minutesString);
    return { hours, minutes };
  }

  /**
   * Determines if a time is in the next day based on schedule
   * @param clockTime The actual clock time
   * @param scheduleTime The scheduled time in 24-hour format
   */
  static isNextDay(clockTime: Date, scheduleTime: string): boolean {
    const { hours, minutes } = this.parseTimeString(scheduleTime);
    const scheduleMoment = dayjs(clockTime).hour(hours).minute(minutes);

    // If schedule time is early morning (like 00:00) and clock time is late night
    // Then the schedule is for next day
    return hours < 12 && dayjs(clockTime).hour() > 12;
  }

  /**
   * Creates a Date object from time string for a specific date
   * @param baseDate The reference date
   * @param timeString Time in 24-hour format (e.g., "18:00")
   */
  static createDateFromTimeString(baseDate: Date, timeString: string): Date {
    const { hours, minutes } = this.parseTimeString(timeString);
    let result = dayjs(baseDate).hour(hours).minute(minutes);

    // If the time is early morning (like 05:00), it's the next day
    if (hours < 12 && dayjs(baseDate).hour() > 12) {
      result = result.add(1, "day");
    }

    return result.toDate();
  }
}
