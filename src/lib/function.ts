var bcrypt = require("bcryptjs");
import { v4 as uuidv4 } from "uuid";
const { DateTime } = require("luxon");
import { access, constants, mkdir, writeFile } from "fs/promises";
import path from "path";

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
  }
  return p;
};
export const saveImageUser = async (img: string) => {
  const buffer = Buffer.from(img, "base64");
  const uniqueSuffix = uuidv4();
  const paths = path.join(process.cwd(), `public/uploads/user/`);
  try {
    await writeFile(`${paths}/${uniqueSuffix}.jpg`, buffer);
  } catch (err) {}
  return `/uploads/user/${uniqueSuffix}.jpg`;
};
export const saveImage = async (img: string) => {
  const buffer = Buffer.from(img, "base64");
  const uniqueSuffix = uuidv4();
  const now = DateTime.now().toFormat("dd-LL-y");
  const paths = await checkFolder(now);
  try {
    await writeFile(`${paths}/${uniqueSuffix}.jpg`, buffer);
  } catch (error) {
    console.log(error);
  }
  return `/uploads/${now}/${uniqueSuffix}.jpg`;
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
