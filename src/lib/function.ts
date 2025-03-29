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
  // try {
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
  // } catch (error) {
  //   console.log(error);
  // }
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
    default:
      return "A";
  }
};
