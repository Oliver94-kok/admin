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
    const { hours: scheduleHours, minutes: scheduleMinutes } =
      this.parseTimeString(scheduleTime);
    const clockMoment = dayjs(clockTime);
    const scheduleMoment = dayjs(clockTime)
      .hour(scheduleHours)
      .minute(scheduleMinutes)
      .second(0)
      .millisecond(0);

    // Compare the schedule time with clock time
    return scheduleMoment.isBefore(clockMoment);
  }

  /**
   * Creates a Date object from time string for a specific date
   * @param baseDate The reference date
   * @param timeString Time in 24-hour format (e.g., "18:00")
   */
  static createDateFromTimeString(baseDate: Date, timeString: string): Date {
    const { hours, minutes } = this.parseTimeString(timeString);
    const baseMoment = dayjs(baseDate);
    let result = baseMoment
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);

    // If the calculated time is before the base time, it should be for the next day
    if (result.isBefore(baseMoment)) {
      result = result.add(1, "day");
    }

    return result.toDate();
  }

  /**
   * Formats a date to ISO string with timezone consideration
   * @param date The date to format
   * @param timezone Optional timezone (defaults to UTC)
   */
  static formatToISO(date: Date, timezone?: string): string {
    let moment = dayjs(date);
    if (timezone) {
      moment = moment.tz(timezone);
    }
    return moment.toISOString();
  }
  /**
   * Formats a date to ISO string with timezone consideration
   * @param timestamp The date to format
   *
   */
  static checkMorning(timestamp: string) {
    // const timestamp = "2024-11-04T22:00:00.000Z";
    const klTime = dayjs(timestamp).tz("Asia/Kuala_Lumpur");
    const hour = klTime.hour();

    // Morning from midnight (00:00) until noon (11:59)
    const isMorning = hour >= 0 && hour < 12;
    return isMorning;
  }
}
