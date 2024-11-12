import { z } from "zod";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Enable dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

// Enums
export enum AttendStatus {
  Present = "PRESENT",
  Absent = "ABSENT",
  Late = "LATE",
}

export type ShiftStatus =
  | "can_clock_in"
  | "can_clock_out"
  | "absent"
  | "shift_not_started"
  | "shift_ended";

// Types
export type ShiftCheckResult = {
  result: ShiftStatus;
  message: string;
  timestamp: Date;
  shiftDetails?: {
    originalShiftIn: Date;
    originalShiftOut: Date;
    adjustedShiftOut: Date;
    graceperiodEnds?: Date;
  };
};

export interface ShiftConfig {
  gracePeriodMinutes?: number;
  maxOvertimeHours?: number;
  timezone?: string;
}

export interface ProcessingResult {
  userId: string;
  status: "marked_absent" | "within_shift_hours";
  timestamp: Date;
  shiftResult?: ShiftStatus;
  message?: string;
}

// Validation schemas
export const AttendanceSchema = z.object({
  userId: z.string(),
  dates: z.date(),
  status: z.enum([
    AttendStatus.Present,
    AttendStatus.Absent,
    AttendStatus.Late,
  ]),
});
export class AttendanceService {
  private config: ShiftConfig;

  constructor(config: ShiftConfig = {}) {
    this.config = {
      gracePeriodMinutes: 15,
      maxOvertimeHours: 4,
      timezone: "UTC",
      ...config,
    };
  }

  async cronAttendCheckShift(
    shiftIn: Date,
    shiftOut: Date,
  ): Promise<ShiftCheckResult> {
    try {
      // Validate input parameters
      if (!(shiftIn instanceof Date) || !(shiftOut instanceof Date)) {
        throw new Error("Invalid shift times provided");
      }

      if (shiftIn > shiftOut) {
        throw new Error("Shift start time cannot be after shift end time");
      }

      const { gracePeriodMinutes, maxOvertimeHours, timezone } = this.config;

      // Set timezone and get current time
      const currentTime = dayjs().tz(timezone);

      // Convert shift times to dayjs objects
      const shiftInTime = dayjs(shiftIn).tz(timezone);
      const shiftOutTime = dayjs(shiftOut).tz(timezone);

      // Calculate extended shift out time and grace period
      const extendedShiftOut = shiftOutTime.add(maxOvertimeHours!, "hour");
      const gracePeriodEnd = shiftInTime.add(gracePeriodMinutes!, "minute");

      // Check various shift conditions
      if (currentTime.isBefore(shiftInTime)) {
        return {
          result: "shift_not_started",
          message: "Shift has not started yet",
          timestamp: currentTime.toDate(),
          shiftDetails: {
            originalShiftIn: shiftIn,
            originalShiftOut: shiftOut,
            adjustedShiftOut: extendedShiftOut.toDate(),
            graceperiodEnds: gracePeriodEnd.toDate(),
          },
        };
      }

      if (currentTime.isBefore(gracePeriodEnd)) {
        return {
          result: "can_clock_in",
          message: "Within grace period for clock in",
          timestamp: currentTime.toDate(),
          shiftDetails: {
            originalShiftIn: shiftIn,
            originalShiftOut: shiftOut,
            adjustedShiftOut: extendedShiftOut.toDate(),
            graceperiodEnds: gracePeriodEnd.toDate(),
          },
        };
      }

      if (currentTime.isBefore(extendedShiftOut)) {
        return {
          result: "can_clock_out",
          message: "Within shift hours (including overtime)",
          timestamp: currentTime.toDate(),
          shiftDetails: {
            originalShiftIn: shiftIn,
            originalShiftOut: shiftOut,
            adjustedShiftOut: extendedShiftOut.toDate(),
          },
        };
      }

      return {
        result: "absent",
        message: "Outside of valid shift hours",
        timestamp: currentTime.toDate(),
        shiftDetails: {
          originalShiftIn: shiftIn,
          originalShiftOut: shiftOut,
          adjustedShiftOut: extendedShiftOut.toDate(),
        },
      };
    } catch (error) {
      console.error("Error checking shift status:", error);
      throw error;
    }
  }
}
