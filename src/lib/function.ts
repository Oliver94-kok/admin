"use server";
var bcrypt = require("bcryptjs");
import { v4 as uuidv4 } from "uuid";
const { DateTime } = require("luxon");
import { access, chmod, constants, mkdir, writeFile } from "fs/promises";
import path from "path";
import { getUserById } from "@/data/user";
import axios from "axios";

export const checkPassword = async (password: string, hash: string) => {
  let p = bcrypt.compareSync(password, hash);
  return p;
};

export const hashPassword = async (password: string) => {
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
};

const checkFolder = async (folder: String) => {
  let p = path.join(process.cwd(), `public/uploads/${folder}`);
  try {
    // Check if the directory already exists
    await access(p);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(p, { recursive: true });
    await chmod(p, 0o777);
  }
  return p;
};
export const saveImageUser = async (img: string, username: string) => {
  const buffer = Buffer.from(img, "base64");
  const uniqueSuffix = uuidv4();
  const paths = path.join(process.cwd(), `public/uploads/user/`);
  try {
    await writeFile(`${paths}/${username}.JPEG`, buffer, { mode: 0o777 });
    // await chmod(`${paths}/${username}.JPEG`, 0o777);
  } catch (err) {}
  return `/uploads/user/${username}.JPEG`;
};
export const saveImage = async (img: string, username: string) => {
  const buffer = Buffer.from(img, "base64");
  const uniqueSuffix = uuidv4();
  const now = DateTime.now().toFormat("dd-LL-y");
  const paths = await checkFolder(now);

  try {
    await writeFile(`${paths}/${username}.jpg`, buffer, { mode: 0o777 });
    // await chmod(`${paths}/${username}.JPEG`, 0o777);
  } catch (error) {
    console.log(error);
  }
  return `/uploads/${now}/${username}.jpg`;
};
export const saveImageLeaveUser = async (img: string, username: string) => {
  const buffer = Buffer.from(img, "base64");
  const uniqueSuffix = uuidv4();
  const paths = path.join(process.cwd(), `public/uploads/leave/`);
  const now = DateTime.now().toFormat("dd-LL-y");
  try {
    await writeFile(`${paths}/${username}_${now}.jpg`, buffer, { mode: 0o777 });
    // await chmod(`${paths}/${username}.JPEG`, 0o777);
  } catch (err) {}
  return `/uploads/leave/${username}_${now}.jpg`;
};
export const checkWorkingHour = async (clockIn: Date, clockOut: Date) => {
  let c = clockIn.toISOString();
  var start = DateTime.fromISO(c);
  var end = DateTime.fromISO(clockOut);
  var hour = end.diff(start, ["hours"]).toObject();
  return hour.hours;
};

export const randomPassword = async () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
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
export const sendtoAdmin = async (title: string, message: string) => {
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
