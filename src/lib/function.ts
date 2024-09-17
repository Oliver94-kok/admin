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
    await access(p, constants.F_OK | constants.R_OK | constants.W_OK);
    console.log("can access");
  } catch (error) {
    await mkdir(p);
  }
  return p;
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
};
