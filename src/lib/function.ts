"use server";
var bcrypt = require("bcryptjs");
import { v4 as uuidv4 } from "uuid";
const { DateTime } = require("luxon");
import { access, chmod, constants, mkdir, writeFile } from "fs/promises";
import path from "path";
import { getUserById } from "@/data/user";
import axios from "axios";
import { SalaryDay } from "@/types/salary";
import { db } from "./db";
import { TimeUtils } from "./timeUtility";
import { Range, utils, writeFileXLSX, write } from "xlsx";
import { AttendanceResult, SalaryRecord } from "@/types/salary2";
import { UserRole } from "@prisma/client";
export const checkPassword = async (password: string, hash: string) => {
  let p = bcrypt.compareSync(password, hash);
  return p;
};

export const hashPassword = async (password: string) => {
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const checkWorkingHour = async (clockIn: Date, clockOut: Date) => {
  console.log("🚀 ~ checkWorkingHour ~ clockIn:", clockIn);

  let c = clockIn.toISOString();
  var start = DateTime.fromISO(c);
  var end = DateTime.fromISO(clockOut);
  var diff = end.diff(start, ["hours"]).toObject();
  const minutes = diff.minutes || 0;

  // If minutes is negative or less than 60 (1 hour), return 0
  if (minutes < 60 || minutes < 0) {
    return 0;
  }

  // Convert minutes to hours and return
  return minutes;
};

export const randomPassword = async () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
};

export const SentNoti = async (
  title: string,
  message: string,
  leaveid: string,
  externalUserId?: string,
  externalUserIds?: [],
) => {
  console.log("🚀 ~ externalUserId:", externalUserId);
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNALAPIKEY;
  const ONESIGNAL_APP_ID = process.env.ONESIGNALAPPID;
  const additionalData = {
    leaveId: leaveid,
  };
  // return { targetUserIds };
  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: "48db9e0a-c176-4c30-ba58-44630340624f",
      target_channel: "push",
      include_aliases: {
        external_id: [externalUserId],
      },
      headings: { en: title },
      contents: { en: message },
      data: additionalData,
    }),
  });

  const data = await response.json();
  console.log(data);
  if (response.ok) {
    return { success: data };
  } else {
    return { error: data };
  }
};
const getRole = (role: string) => {
  switch (role) {
    case "MANAGER_A":
      return UserRole.MANAGER_A;
    case "MANAGER _B":
      return UserRole.MANAGER_B;
    case "MANAGER_C":
      return UserRole.MANAGER_C;
    case "MANAGER_D":
      return UserRole.MANAGER_D;
    case "MANAGER_E":
      return UserRole.MANAGER_E;
    default:
      break;
  }
};
export const sendtoAdmin = async (
  title: string,
  message: string,
  team: string,
) => {
  //save at db
  let role = getRole(`MANAGER_${team}`);
  let admin = await db.user.findFirst({ where: { role } });
  let notityAdmin = await db.notificationUser.findFirst({
    where: { userId: admin?.id },
  });
  const currentArray = Array.isArray(notityAdmin?.leave)
    ? notityAdmin?.leave
    : [];
  let notify = {
    id: crypto.randomUUID(),
    msg: message,
  };
  const updatedArray = [...currentArray, notify];
  await db.notificationUser.update({
    where: { id: notityAdmin?.id },
    data: { leave: updatedArray },
  });
  //SENT NOTIFICATION TO ADMIN
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNALAPIKEY;
  const ONESIGNAL_APP_ID = process.env.ONESIGNALAPPID;
  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: "48db9e0a-c176-4c30-ba58-44630340624f",
      target_channel: "push",
      included_segments: ["admin", "Inactive Users"],
      headings: { en: title },
      contents: { en: message },
    }),
  });

  const data = await response.json();
  console.log(data);
  if (response.ok) {
    return { success: data };
  } else {
    return { error: data };
  }
};

export const slideDate = async (date: string) => {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);

  return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
};

export const getDateFromISOString = async (isoDateTimeString: string) => {
  const dateTime = new Date(isoDateTimeString);
  console.log(
    "🚀 ~ getDateFromISOString ~ dateTime:",
    isoDateTimeString.split("T")[0],
  );
  return isoDateTimeString.split("T")[0];
};

export const formatDateTime = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month} ${hours}:${minutes}`;
};
export const formatDateTimeIntl = (date: Date): string => {
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dateFormatter} ${timeFormatter}`;
};

export const postImage = async (
  image: string,
  username: string,
  type: string,
) => {
  try {
    let data = {
      image,
      username,
      type,
    };
    var res = await axios.post("http://localhost:3001/api/saveImage", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("🚀 ~ res:", res.status);
    if (res.status == 201) {
      console.log(res.data);
      return { success: res.data.url };
    }
    if (res.status == 400 || res.status == 500) {
      return { error: res.data.error };
    }
  } catch (error) {
    return { error: error };
  }
};
export async function extractDateAndDay(dateTimeString: string) {
  const [dateString] = dateTimeString.split(" ");
  const [day, month, year] = dateString.split("-");
  return {
    date: dateString,
    day: parseInt(day, 10),
    month: parseInt(month),
    year: parseInt(year),
  };
}
export async function extractDateAndTime(dateTimeString: string) {
  const [dateString, time, period] = dateTimeString.split(" ");
  const [day, month, year] = dateString.split("-");

  return {
    date: dateString,
    day: parseInt(day, 10),
    month: parseInt(month, 10),
    year: parseInt(year, 10),
    time: `${time} ${period}` // Combines time and AM/PM
  };
}
export async function countDaysBetween(
  startDate: string,
  endDate: string,
): Promise<number> {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the time difference in milliseconds
  const timeDiff = end.getTime() - start.getTime();

  // Convert milliseconds to days
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}
export const mergeArrays = async (
  existing: SalaryDay[],
  newItems: SalaryDay[],
): Promise<SalaryDay[]> => {
  const map = new Map();

  // Add existing items first
  existing.forEach((item) => {
    map.set(item.id, item);
  });

  // Add or update with new items
  newItems.forEach((item) => {
    map.set(item.id, item);
  });

  return Promise.resolve(Array.from(map.values()));
};
interface updateSalaryDaysProp {
  newData: SalaryDay[];
  month: number;
  year: number;
  userId: string;
}

export const getYesterday = async (date: string) => {
  let dates = DateTime.fromISO(date);
  let dateid = dates.minus({ days: 1 }).toFormat("dd");
  return {
    id: dateid,
    yesterday: dates.minus({ days: 1 }).toFormat("dd-MM-yyyy"),
  };
};
interface checkShiftProp {
  date?: string;
  userId: string;
}
export const checkShift = async ({ date, userId }: checkShiftProp) => {
  let shift = await db.attendBranch.findFirst({
    where: { userId },
    select: { clockIn: true, clockOut: true },
  });
  const now = new Date();
  let clockInShift = TimeUtils.createDateFromTimeString(
    now,
    shift?.clockIn!,
    "in",
  );
  let clockOutShift = TimeUtils.createDateFromTimeString(
    now,
    shift?.clockOut!,
    "out",
  );
  return { clockInShift, clockOutShift };
};

export const roleAdmin = async (role: string) => {
  let lowCase = role.toLocaleLowerCase();
  switch (lowCase) {
    case "manager_a":
      return "A";
    case "manager_b":
      return "B";
    case "manager_c":
      return "C";
    case "manager_d":
      return "D";
    case "manager_e":
      return "E";
    case "swmanager":
      return "SW";
    case "manager_ocean":
      return "Ocean";
    case "manager_office":
      return "Office";
    case "assistant_a":
      return "A";
    case "assistant_b":
      return "B";
    case "assistant_c":
      return "C";
    case "assistant_d":
      return "D";
    case "assistant_e":
      return "E";
    default:
      return "A";
  }
};
/**
 * Calculates the time difference between two timestamps and determines if it's a half-day
 * based on the user's shift duration
 * 
 * @param startTime - Start time in format "DD-MM-YYYY HH:MM AM/PM"
 * @param endTime - End time in format "DD-MM-YYYY HH:MM AM/PM"
 * @param shiftStart - Optional user shift start time in format "HH:MM" (24-hour)
 * @param shiftEnd - Optional user shift end time in format "HH:MM" (24-hour)
 * @returns Object with hours, isHalfDay flag and percentage of shift worked
 */
export async function calculateTimeDifference(
  startTime: string,
  endTime: string,
  shiftStart?: string,
  shiftEnd?: string
): Promise<{
  hours: number;
  isHalfDay: boolean;
  percentageOfShift?: number;
}> {
  try {
    console.log("🚀 ~ calculateTimeDifference inputs:", { startTime, endTime, shiftStart, shiftEnd });

    // Parse the date strings - defensive coding to handle potential malformed input
    const startParts = startTime.split(' ');
    const endParts = endTime.split(' ');

    if (startParts.length < 3 || endParts.length < 3) {
      console.error("Invalid date format. Expected 'DD-MM-YYYY HH:MM AM/PM'");
      return { hours: 0, isHalfDay: false };
    }

    const startDateStr = startParts[0];
    const startTimeStr = startParts[1];
    const startPeriod = startParts[2];

    const endDateStr = endParts[0];
    const endTimeStr = endParts[1];
    const endPeriod = endParts[2];

    // Parse date components (DD-MM-YYYY)
    const startDateParts = startDateStr.split('-');
    const endDateParts = endDateStr.split('-');

    if (startDateParts.length !== 3 || endDateParts.length !== 3) {
      console.error("Invalid date format. Expected 'DD-MM-YYYY'");
      return { hours: 0, isHalfDay: false };
    }

    const startDay = parseInt(startDateParts[0], 10);
    const startMonth = parseInt(startDateParts[1], 10);
    const startYear = parseInt(startDateParts[2], 10);

    const endDay = parseInt(endDateParts[0], 10);
    const endMonth = parseInt(endDateParts[1], 10);
    const endYear = parseInt(endDateParts[2], 10);

    // Parse time components
    const startTimeParts = startTimeStr.split(':');
    const endTimeParts = endTimeStr.split(':');

    if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
      console.error("Invalid time format. Expected 'HH:MM'");
      return { hours: 0, isHalfDay: false };
    }

    let startHour = parseInt(startTimeParts[0], 10);
    let startMinute = parseInt(startTimeParts[1], 10);

    let endHour = parseInt(endTimeParts[0], 10);
    let endMinute = parseInt(endTimeParts[1], 10);

    // Convert to 24-hour format
    if (startPeriod === 'PM' && startHour < 12) startHour += 12;
    if (startPeriod === 'AM' && startHour === 12) startHour = 0;
    if (endPeriod === 'PM' && endHour < 12) endHour += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour = 0;

    console.log("🚀 ~ Parsed times:", {
      start: `${startYear}-${startMonth}-${startDay} ${startHour}:${startMinute}`,
      end: `${endYear}-${endMonth}-${endDay} ${endHour}:${endMinute}`
    });

    // Create Date objects
    const startDate = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
    const endDate = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

    // Calculate difference in milliseconds
    const diffMs = endDate.getTime() - startDate.getTime();

    // Convert to hours
    const hours = diffMs / (1000 * 60 * 60);

    console.log("🚀 ~ Calculated hours:", hours);

    // Calculate shift duration if shift times are provided
    let isHalfDay = false;
    let percentageOfShift: number | undefined = undefined;

    if (shiftStart && shiftEnd) {
      // Parse shift hours
      const shiftStartParts = shiftStart.split(':');
      const shiftEndParts = shiftEnd.split(':');

      if (shiftStartParts.length !== 2 || shiftEndParts.length !== 2) {
        console.error("Invalid shift time format. Expected 'HH:MM'");
        // Fall back to standard calculation
        isHalfDay = hours >= 3.5 && hours <= 5;
        return { hours, isHalfDay };
      }

      const shiftStartHour = parseInt(shiftStartParts[0], 10);
      const shiftStartMinute = parseInt(shiftStartParts[1], 10);

      const shiftEndHour = parseInt(shiftEndParts[0], 10);
      const shiftEndMinute = parseInt(shiftEndParts[1], 10);

      // Calculate total shift hours
      let shiftHours = shiftEndHour - shiftStartHour +
        (shiftEndMinute - shiftStartMinute) / 60;

      // Handle overnight shifts
      if (shiftHours < 0) {
        shiftHours += 24;
      }

      console.log("🚀 ~ Shift hours:", shiftHours);

      // Calculate percentage of shift worked
      percentageOfShift = (hours / shiftHours) * 100;
      console.log("🚀 ~ Percentage of shift:", percentageOfShift);

      // Determine if it's a half day (between 40% and 60% of shift duration)
      isHalfDay = percentageOfShift >= 40 && percentageOfShift <= 60;
      console.log("🚀 ~ Is half day (shift-based):", isHalfDay);
    } else {
      // Default behavior when no shift information is provided
      // Determine if it's a half day (typically between 3.5 to 5 hours for a standard 8-hour shift)
      isHalfDay = hours >= 3.5 && hours <= 5;
      console.log("🚀 ~ Is half day (standard):", isHalfDay);
    }

    return {
      hours,
      isHalfDay,
      percentageOfShift
    };
  } catch (error) {
    console.error("Error calculating time difference:", error);
    return { hours: 0, isHalfDay: false };
  }
}