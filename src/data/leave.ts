'use server'
import { db } from "@/lib/db";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import duration from 'dayjs/plugin/duration';
// Enable the plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
const TIMEZONE = "Asia/Kuala_Lumpur";
export async function forEachDate(
  startDate: string,
  endDate: string,
  callback: (date: Date) => void,
  format: string = "DD-MM-YYYY",
) {
  let currentDate = dayjs(startDate, format).tz(TIMEZONE).startOf("day");
  const lastDate = dayjs(endDate, format).tz(TIMEZONE).startOf("day");

  while (currentDate.isSameOrBefore(lastDate)) {
    callback(currentDate.toDate());
    currentDate = currentDate.add(1, "day");
  }
}

export const addLeaveAttend = async (userId: string, date: string, ishalf?: boolean) => {
  const time2 = new Date(date);

  let checkAttend = await db.attends.findFirst({
    where: { userId, dates: time2 },
  });


  if (checkAttend) {

    await db.attends.update({
      where: { id: checkAttend.id },
      data: { status: ishalf ? AttendStatus.Half_Day : AttendStatus.Leave, fine: 0 },
    });
    return;
  }
  let data = {
    status: ishalf ? AttendStatus.Half_Day : AttendStatus.Leave,
    userId,
    dates: time2,
  };
  await db.attends.create({ data });
  return;
};


interface LeaveCalculatorInput {
  shiftStart: string;         // Format: "HH:mm" (24-hour format)
  shiftEnd: string;           // Format: "HH:mm" (24-hour format)
  leaveStart: string;         // Format: "DD-MM-YYYY HH:mm AM/PM"
  leaveEnd: string;           // Format: "DD-MM-YYYY HH:mm AM/PM"
  userId: string
  includeWeekends?: boolean;  // Optional: whether to include weekends, default true
}

// Define half-day types
enum HalfDayType {
  NONE = "Full Day",
  MORNING = "Morning Half-Day",
  AFTERNOON = "Afternoon Half-Day"
}

interface DayBreakdown {
  date: string;
  hours: number;
  halfDayType: HalfDayType;
  isWeekend: boolean;
}

/**
 * Calculates leave hours based on shift times and leave period
 * Adapted for Next.js server actions with async pattern
 */
async function calculateLeaveHours(input: LeaveCalculatorInput): Promise<{
  totalHours: number;
  breakdown: DayBreakdown[];
}> {
  const { shiftStart, shiftEnd, leaveStart, leaveEnd, includeWeekends = true } = input;

  // Parse shift times
  const shiftStartObj = dayjs(`1970-01-01 ${shiftStart}`);
  const shiftEndObj = dayjs(`1970-01-01 ${shiftEnd}`);

  // Calculate shift duration in minutes (handle overnight shifts)
  const shiftStartMins = shiftStartObj.hour() * 60 + shiftStartObj.minute();
  const shiftEndMins = shiftEndObj.hour() * 60 + shiftEndObj.minute();

  // Calculate shift duration properly for overnight shifts
  let shiftDurationMins;
  if (shiftEndMins > shiftStartMins) {
    // Normal shift (same day)
    shiftDurationMins = shiftEndMins - shiftStartMins;
  } else {
    // Overnight shift (spans midnight)
    shiftDurationMins = (24 * 60 - shiftStartMins) + shiftEndMins;
  }

  const halfDayMins = shiftDurationMins / 2;

  // Calculate lunch break (mid-point of shift)
  let lunchBreakMins = shiftStartMins + halfDayMins;
  // Adjust lunch break if it crosses midnight
  if (lunchBreakMins >= 24 * 60) {
    lunchBreakMins -= 24 * 60;
  }

  // Rest of your existing code remains the same...
  const halfDayThreshold = 60; // 60 minutes threshold instead of 30

  // Parse leave dates
  const leaveStartObj = dayjs(leaveStart, 'DD-MM-YYYY HH:mm A');
  const leaveEndObj = dayjs(leaveEnd, 'DD-MM-YYYY HH:mm A');

  // Number of days between start and end dates (inclusive)
  const totalDays = leaveEndObj.diff(leaveStartObj, 'day') + 1;

  // Initialize total leave hours and breakdown
  let totalLeaveMinutes = 0;
  const breakdown: DayBreakdown[] = [];

  // Loop through each day of leave
  for (let i = 0; i < totalDays; i++) {
    const currentDate = leaveStartObj.add(i, 'day');
    const dateStr = currentDate.format('DD-MM-YYYY');
    const dayOfWeek = currentDate.day();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    // Skip weekends if not included
    if (!includeWeekends && isWeekend) {
      breakdown.push({
        date: dateStr,
        hours: 0,
        halfDayType: HalfDayType.NONE,
        isWeekend: true
      });
      continue;
    }

    // Calculate minutes for this day
    let dayMinutes = shiftDurationMins;
    let halfDayType = HalfDayType.NONE;

    // Handle first day
    if (i === 0) {
      const startTimeMinutes = currentDate.hour() * 60 + currentDate.minute();

      // If leave starts after shift starts
      if (startTimeMinutes > shiftStartMins) {
        dayMinutes -= (startTimeMinutes - shiftStartMins);

        // Check if it's an afternoon half-day
        if (Math.abs(startTimeMinutes - lunchBreakMins) < halfDayThreshold) {
          halfDayType = HalfDayType.AFTERNOON;
        }
      }
    }

    // Handle last day
    if (i === totalDays - 1) {
      const endDate = leaveEndObj;
      const endTimeMinutes = endDate.hour() * 60 + endDate.minute();

      // If leave ends before shift ends
      if (endTimeMinutes < shiftEndMins) {
        dayMinutes -= (shiftEndMins - endTimeMinutes);

        // Check if it's a morning half-day
        if (Math.abs(endTimeMinutes - lunchBreakMins) < halfDayThreshold) {
          halfDayType = HalfDayType.MORNING;
        }
      }
    }

    // Check for half-day patterns if not already determined
    if (halfDayType === HalfDayType.NONE && dayMinutes <= (halfDayMins + halfDayThreshold) && dayMinutes >= (halfDayMins - halfDayThreshold)) {
      // If it's close to exactly half a day, determine morning or afternoon based on time
      if (i === 0) {
        const startTime = currentDate.hour() * 60 + currentDate.minute();
        halfDayType = startTime <= shiftStartMins ? HalfDayType.MORNING : HalfDayType.AFTERNOON;
        console.log("🚀 ~ calculateLeaveHours ~ halfDayType:first", halfDayType, currentDate)
      } else if (i === totalDays - 1) {

        const endTime = leaveEndObj.hour() * 60 + leaveEndObj.minute();
        halfDayType = endTime >= shiftEndMins ? HalfDayType.AFTERNOON : HalfDayType.MORNING;
        console.log("🚀 ~ calculateLeaveHours ~ halfDayType:end", halfDayType, endTime)
      }
    }

    // Add to total
    totalLeaveMinutes += dayMinutes;

    // Add to breakdown
    breakdown.push({
      date: dateStr,
      hours: dayMinutes / 60,
      halfDayType,
      isWeekend
    });
  }

  // Return result
  return {
    totalHours: totalLeaveMinutes / 60,
    breakdown
  };
}

/**
 * Formats leave breakdown result into readable strings
 */
async function formatLeaveBreakdown(result: { totalHours: number; breakdown: DayBreakdown[] }): Promise<string[]> {
  const { totalHours, breakdown } = result;
  const lines: string[] = ['Leave breakdown:'];

  let totalWorkingDays = 0;
  let fullDays = 0;
  let halfDays = {
    [HalfDayType.MORNING]: 0,
    [HalfDayType.AFTERNOON]: 0
  };

  // Process each day
  breakdown.forEach(day => {
    if (day.isWeekend && day.hours === 0) {
      lines.push(`${day.date} - Weekend, no leave counted`);
      return;
    }

    totalWorkingDays++;

    // Track day types
    if (day.halfDayType === HalfDayType.MORNING || day.halfDayType === HalfDayType.AFTERNOON) {
      halfDays[day.halfDayType]++;
    } else {
      fullDays++;
    }

    lines.push(`${day.date} - ${day.hours.toFixed(2)} hours (${day.halfDayType})`);
  });

  // Add summary
  lines.push(`\nTotal working days: ${totalWorkingDays}`);
  lines.push(`Full days: ${fullDays}`);
  lines.push(`Morning half-days: ${halfDays[HalfDayType.MORNING]}`);
  lines.push(`Afternoon half-days: ${halfDays[HalfDayType.AFTERNOON]}`);
  lines.push(`Total leave hours: ${totalHours.toFixed(2)}`);

  return lines;
}

/**
 * Main function to calculate leave - ready for use with Next.js server actions
 * Add 'use server' directive at the top of your file when using this function
 */
export async function calculateMyLeave(
  shiftStart: string,
  shiftEnd: string,
  leaveStart: string,
  leaveEnd: string,
  userId: string,
  includeWeekends: boolean = true
): Promise<string[]> {
  const result = await calculateLeaveHours({
    shiftStart,
    shiftEnd,
    leaveStart,
    leaveEnd,
    userId,
    includeWeekends
  });

  return formatLeaveBreakdown(result);
}

/**
 * Alternative function that returns structured data instead of formatted strings
 * Use this if you want to handle the formatting in your UI layer
 */
export async function calculateLeaveData(
  shiftStart: string,
  shiftEnd: string,
  leaveStart: string,
  leaveEnd: string,
  userId: string,
  includeWeekends: boolean = true
): Promise<{
  totalHours: number;
  breakdown: DayBreakdown[];
  summary: {
    totalWorkingDays: number;
    fullDays: number;
    morningHalfDays: number;
    afternoonHalfDays: number;
  }
}> {
  const result = await calculateLeaveHours({
    shiftStart,
    shiftEnd,
    leaveStart,
    leaveEnd,
    userId,
    includeWeekends
  });

  // Calculate summary data
  let totalWorkingDays = 0;
  let fullDays = 0;
  let morningHalfDays = 0;
  let afternoonHalfDays = 0;

  result.breakdown.forEach(day => {
    if (!day.isWeekend || (day.isWeekend && day.hours > 0)) {
      totalWorkingDays++;

      if (day.halfDayType === HalfDayType.MORNING) {
        morningHalfDays++;
      } else if (day.halfDayType === HalfDayType.AFTERNOON) {
        afternoonHalfDays++;
      } else {
        fullDays++;
      }
    }
  });

  return {
    ...result,
    summary: {
      totalWorkingDays,
      fullDays,
      morningHalfDays,
      afternoonHalfDays
    }
  };
}