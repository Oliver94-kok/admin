"use server";
import { getUserByUsernameWithAttend } from "@/data/user"; // Assuming UserWithAttendBranch is a more specific type
import { db } from "@/lib/db";
import { decrypt, encrypt, } from "@/lib/session"; // Assuming SessionPayload type from session.ts
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const TRACKER_USERNAMES = ['user80', 'user77', 'user78', 'user79', 'user135', 'user136', 'user137', 'user187', 'user274', 'user258'].map(u => u.trim()); // Trim spaces

async function processAndRespond(
  userForProcessing: { id: string; username: string; /* other fields needed from initial user lookup */ },
  currentToken: string
) {
  const detailedUserData = await getUserByUsernameWithAttend(userForProcessing.username);

  if (!detailedUserData) {
    // This should ideally not happen if userForProcessing.username is valid
    throw new Error("Failed to retrieve detailed user information.");
  }

  const isTrackerRole = TRACKER_USERNAMES.includes(detailedUserData.username);

  const branches = await db.branch.findMany({
    where: { team: detailedUserData.AttendBranch?.team },
  });

  let finalShiftData = detailedUserData.AttendBranch;
  // if (detailedUserData.AttendBranch?.startOn) {
  //   const today = dayjs();
  //   const startOnDate = dayjs(detailedUserData.AttendBranch.startOn);
  //   if (today.isSame(startOnDate, 'day')) {
  //     finalShiftData = await db.attendBranch.update({
  //       where: { id: detailedUserData.AttendBranch.id },
  //       data: {
  //         clockIn: detailedUserData.AttendBranch.clockInNew,
  //         clockOut: detailedUserData.AttendBranch.clockOutNew,
  //         startOn: null,
  //       },
  //     });
  //   }
  // }

  return Response.json({
    data: {
      id: detailedUserData.id,
      name: detailedUserData.name,
      username: detailedUserData.username,
      token: currentToken, // Use the token that is currently in effect
      userImg: detailedUserData.userImg,
      isLogin: detailedUserData.isLogin,
      role: isTrackerRole ? "Tracker" : detailedUserData.role,
      AttendBranch: finalShiftData,
    },
    branch: branches,
  }, { status: 200 });
}


export const POST = async (req: Request) => {
  try {
    const { token: tokenFromRequest } = await req.json();

    if (!tokenFromRequest) {
      return Response.json({ Error: "Token not provided" }, { status: 400 });
    }

    // Find user by the token they provided (which should be the one in user.token)
    const user = await db.user.findFirst({ where: { token: tokenFromRequest } });

    if (!user) {
      // Token doesn't match any user's stored token OR user doesn't exist
      return Response.json({ Error: "Invalid session or user not found." }, { status: 401 });
    }

    if (user.isDelete) {
      return Response.json({ Error: "User account has been deleted." }, { status: 403 });
    }

    let sessionDetails = await decrypt(tokenFromRequest);
    let effectiveToken = tokenFromRequest;

    if (!sessionDetails) {
      // Token is invalid (e.g., expired, malformed, wrong signature)
      // Refresh the token
      console.log(`Token for user ${user.username} (ID: ${user.id}) is invalid/expired. Refreshing.`);
      const newPayload = { userId: user.id, username: user.username }; // Add other consistent payload fields
      const newEncryptedToken = await encrypt(newPayload);

      await db.user.update({
        where: { id: user.id },
        data: { token: newEncryptedToken }, // Update DB with the new token
      });
      effectiveToken = newEncryptedToken; // The new token is now the one to use
      // The 'user' object fetched earlier is still valid for identity (id, username)
    }

    // 'user' contains the basic user identity. 'effectiveToken' is the token to be returned.
    return await processAndRespond(user, effectiveToken);

  } catch (error) {
    console.error("POST Request Error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    // Determine status code based on error type if possible
    if (message.includes("Invalid session") || message.includes("User not found")) {
      return Response.json({ Error: message }, { status: 401 });
    }
    if (message.includes("deleted")) {
      return Response.json({ Error: message }, { status: 403 });
    }
    return Response.json({ Error: message }, { status: (error instanceof Error && 'statusCode' in error) ? (error as any).statusCode : 500 });
  }
};