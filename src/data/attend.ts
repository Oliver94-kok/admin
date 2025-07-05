"use server";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";
import { DateTime } from "luxon";
import { calculateShiftAllowance, calculateTotalSalaryUser, CheckSalarys, createSalary, getAttendLate, getNoClockIn, getSalaryByUserId } from "./salary";
import { Attends, AttendStatus } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { TimeUtils } from "@/lib/timeUtility";
import { postImage, SentNoti } from "@/lib/function";
import { notificationClock } from "./notification";
import { Logging } from "./log";
import { branchAssistant } from "@/types/branchs";

// Enable required dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export const checkClockIn = async (userId: string) => {
  console.log("🚀 ~ checkClockIn ~ userId:", userId);
  try {
    const today = dayjs();
    const t = new Date(today.format("YYYY-MM-DD"));
    let user = await db.attends.findFirst({
      where: {
        userId,
        status: "Active",
      },

    });
    if (!user) {
      user = await db.attends.findFirst({ where: { userId, dates: t } })
    }
    return user;
  } catch (error) {
    return null;
  }
};

export const checkClockLate = async (userid: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM Attends WHERE userId=${userid} AND date(clockIn) = CURDATE()`;
  let checkLate = a[0];
  let hours = checkLate.clockIn.getHours();
  let minutes = checkLate.clockIn.getMinutes();
  let late;
  if (hours == 9) {
    if (minutes > 10) {
      late = 1;
    }
  } else if (hours > 9) {
    late = 1;
  } else {
    late = 0;
  }
  let year = checkLate.clockIn.getFullYear();
  let month = checkLate.clockIn.getMonth() + 1;
  let day = checkLate.clockIn.getDate();
  return { late, year, month, day };
};

export const getDataByDate = async (tarikh: string) => {
  let day = tarikh.split("/");
  let year = new Date().getFullYear();
  let d = `${year}-${day[1]}-${day[0]}`;

  let data: AttendsInterface[] =
    await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour
    FROM Attends AS a
    JOIN User AS u ON a.userId = u.id
    WHERE (date(a.clockIn) = date(${d}) OR date(a.clockOut) = date(${d}))`;
  console.log(d);
  console.log(data);
  return data;
};

export const calOverTime = async (userId: string, clockOut: string) => {
  let user = await db.attendBranch.findFirst({ where: { userId } });
  if (user) {
    // let c = clockOut.toISOString();
    var start = DateTime.fromISO(clockOut);
    console.log("🚀 ~ calOverTime ~ start:", start);

    var end = DateTime.fromISO(user.clockOut!);
    console.log("🚀 ~ calOverTime ~ end:", end);
    var hour = start.diff(end, ["hours", "minutes", "seconds"]);
    console.log(hour);
    var min = hour.minutes;
    return hour.as("minute").toFixed();
  }
};
export const calOverTime2 = async (userId: string, clockOut: string) => {
  console.log("🚀 ~ calOverTime2 ~ clockOut:", clockOut);
  const formattedTimestamp = clockOut.replace(" ", "T");
  let user = await db.attendBranch.findFirst({ where: { userId } });
  if (user) {
    var start = DateTime.fromISO(formattedTimestamp);
    console.log("🚀 ~ calOverTime ~ start:", start);

    var end = DateTime.fromISO(user.clockOut!).set({
      year: start.year,
      month: start.month,
      day: start.day,
    });

    console.log("🚀 ~ calOverTime ~ end:", end);

    var hour = start.diff(end, ["hours", "minutes", "seconds"]);
    console.log("hour sd ", hour);
    var min = hour.minutes;
    var checkNegative = hour.as("minute").toFixed();
    if (Number(checkNegative) < 0) {
      return 0;
    }
    return hour.as("minute").toFixed();
  }
};

export const calculateOvertimeHours = async (
  shiftEndTime: any,
  actualClockOutTime: any,
) => {
  const scheduledEnd = dayjs(shiftEndTime);
  const actualClockOut = dayjs(actualClockOutTime);

  // Check if actual clock out is before or equal to scheduled end time
  if (actualClockOut.isSameOrBefore(scheduledEnd)) {
    return 0; // No overtime if clock out is not later than scheduled end
  }

  // Calculate total overtime minutes
  const overtimeMinutes = dayjs
    .duration(actualClockOut.diff(scheduledEnd))
    .asMinutes();

  // Calculate full hours of overtime, ensuring no negative value
  const overtimeHours = Math.max(0, Math.floor(overtimeMinutes / 60));

  return overtimeHours;
};

export const calculateWorkingHours = async (
  clockInTime: any,
  clockOutTime: any,
) => {
  // Convert to Day.js objects
  const clockIn = dayjs(clockInTime);
  const clockOut = dayjs(clockOutTime);

  // Calculate total duration in hours
  const workingHours = dayjs.duration(clockOut.diff(clockIn)).asHours();

  // Round to 2 decimal places
  return Number(workingHours.toFixed(2));
};
export const isOffDay = async (
  offDays: string[],
  type: "TODAY" | "YESTERDAY",
): Promise<boolean> => {
  if (type == "TODAY") {
    var currentDayName = dayjs().format("dddd");
  } else {
    var currentDayName = dayjs().subtract(1, "day").format("dddd");
  }

  return offDays.some((day) =>
    currentDayName.toLowerCase().startsWith(day.toLowerCase().slice(0, 3)),
  );
};

export const lateClockIn = async (userId: string, clockIn: string) => {
  let user = await db.attendBranch.findFirst({ where: { userId } });
  if (user) {
    var start = DateTime.fromISO(clockIn);
    var time = DateTime.fromISO(user.clockIn!);
    var result = start.diff(time, ["hours", "minutes", "seconds"]);
    let min = result.as("minutes");
    let minute = result.toObject().minutes;

    if (min <= 0) return 0;
    if (minute! <= 10) return 0;

    return 1;
  }
  return null;
};

export const leaveForgetClockAttend = async (dates: string, userId: string, leaveId: string) => {
  console.log("🚀 ~ leaveForgetClockAttend ~ userId:", dates);
  const date = new Date(
    Date.parse(dates.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")),
  );
  console.log("🚀 ~ leaveForgetClockAttend ~ date:", date);
  const formattedDate = date.toISOString().split("T")[0];
  let user = await db.attends.findFirst({
    where: { userId, dates: { equals: date } },
  });
  console.log("🚀 ~ leaveForgetClockAttend ~ user:", user);
  let shift = await db.attendBranch.findFirst({ where: { userId } })
  let c = shift?.clockIn?.split(":");
  let e = shift?.clockOut?.split(":")
  let newdate = dayjs(date).set('hour', Number(c![0])).set('minute', Number(c![1]))
  let newdate2 = dayjs(date).set('hour', Number(e![0])).set('minute', Number(e![1]))
  if (user) {

    let data = {
      clockIn: newdate.toISOString(),
      clockOut: newdate2.toISOString(),
      workingHour: null,
      locationIn: null,
      locationOut: null,
      overtime: null,
      fine: null,
      status: AttendStatus.Full_Attend,
      leaveId
    };
    await db.attends.update({ where: { id: user.id }, data });
    return user;
  }
  let data = {
    dates: date,
    userId,
    clockIn: newdate.toISOString(),
    clockOut: newdate2.toISOString(),
    status: AttendStatus.Full_Attend,
    leaveId
  };
  let attend = await db.attends.create({ data });
  return attend;
};

export const deliveryClockAttend = async (dates: string, userId: string, leaveId: string) => {
  const date = new Date(
    Date.parse(dates.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")),
  );
  console.log("🚀 ~ deliveryClockAttend ~ date:", date)
  let user = await db.attends.findFirst({
    where: { userId, dates: { equals: date } },
  });
  let shift = await db.attendBranch.findFirst({ where: { userId } })
  let c = shift?.clockIn?.split(":");
  let e = shift?.clockOut?.split(":");
  let newdate = dayjs(date).set('hour', Number(c![0])).set('minute', Number(c![1]))
  let newdate2 = dayjs(date).set('hour', Number(e![0])).set('minute', Number(e![1]))
  console.log("🚀 ~ deliveryClockAttend ~ newdate:", newdate)
  if (!user) {
    let data = {
      userId,
      clockIn: newdate.toISOString(),
      dates: date,
      status: AttendStatus.Active,
      leaveId
    };
    let result = await db.attends.create({ data });
    return result;
  }
  let data;
  if (user.status == "No_ClockIn_ClockOut" || user.status == "No_clockIn_ClockOut_Late") {
    data = {
      status: AttendStatus.Full_Attend,
      clockIn: user.clockIn ? user.clockIn : newdate.toISOString(),
      clockOut: user.clockOut ? user.clockOut : newdate2.toISOString(),
      leaveId,
      fine: null,
      fine2: null
    }
  } else {
    data = {
      status: user.clockOut ? AttendStatus.Full_Attend : AttendStatus.Active,
      clockIn: newdate.toISOString(),
      fine: null,
      fine2: null
    };
  }

  let result = await db.attends.update({ where: { id: user.id }, data });
  let salary = await db.salary.findFirst({
    where: { userId, month: date.getMonth() + 1, year: date.getFullYear() },
  });
  let late = salary?.fineLate! - user.fine!;
  await db.salary.update({
    where: { id: salary?.id },
    data: { fineLate: late },
  });
  return result;
};

export const cronAttend = async (date: string) => {
  let dates = new Date(date);
  let resutl = await db.attends.findMany({
    where: { dates, users: { role: "USER" } },
  });
  return resutl;
};
export const cronAttendCheckShift = async (shiftIn: Date, shiftOut: Date) => {
  const baseMoment = dayjs();
  const inShift = dayjs(shiftIn);
  const outShift = dayjs(shiftOut).add(4, "hour");
  if (baseMoment.isBefore(inShift)) {
    return { result: "can clock in" };
  }
  if (baseMoment.isBefore(outShift)) {
    return { result: "can clock out" };
  }
  return { result: "absent" };
};

export async function getLastThreeMonthsData(userId: string) {
  const currentDate = dayjs();
  const startDate = currentDate.subtract(2, "month").startOf("month").toDate();
  const endDate = currentDate.endOf("month").toDate();

  const monthsData = await Promise.all(
    [0, 1, 2].map(async (monthsAgo) => {
      const date = currentDate.subtract(monthsAgo, "month");
      const startOfMonth = date.startOf("month").toDate();
      const endOfMonth = date.endOf("month").toDate();

      const [attendanceData, counts] = await Promise.all([
        db.attends.findMany({
          where: {
            userId,
            dates: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            id: true,
            clockIn: true,
            clockOut: true,
            status: true,
            dates: true,
            leaves: { select: { type: true } }
          },
          orderBy: {
            dates: "desc",
          },
        }),
        db.attends.groupBy({
          by: ["status"],
          where: {
            userId,
            dates: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            status: {
              in: ["Full_Attend", "Absent", "Late"],
            },
          },
          _count: true,
        }),
      ]);

      return {
        month: date.format("M"),
        data: attendanceData,
        stats: {
          fullAttend:
            counts.find((c) => c.status === "Full_Attend")?._count ?? 0,
          absent: counts.find((c) => c.status === "Absent")?._count ?? 0,
          leave: counts.find((c) => c.status === "Late")?._count ?? 0,
        },
      };
    }),
  );

  return monthsData;
}
const addAttendByDate = async () => {
  try {
    let today = new Date("2025-01-01");
    const users = await db.attends.findMany({
      where: { dates: today, users: { AttendBranch: { team: "D" } } },
    });
    const results = await Promise.allSettled(
      users.map(async (u) => {
        try {
          if (
            u.status == "Full_Attend" ||
            u.status == "No_ClockIn_ClockOut" ||
            u.status == "Leave" ||
            u.status == "OffDay"
          ) {
            return {
              userId: u.id,
              attend_status: u.status,
              type: "Have",
            };
          }
          let shift = await db.attendBranch.findFirst({
            where: { userId: u.userId },
          });
          if (!shift?.clockIn || !shift?.clockOut) {
            throw new Error(`No shift found for user ${u.userId}`);
          }

          const now = new Date();
          const shiftIn = TimeUtils.createDateFromTimeString(
            today,
            shift.clockIn,
            "in",
          );
          const shiftOut = TimeUtils.createDateFromTimeString(
            today,
            shift.clockOut,
            "out",
          );
          await db.attends.update({
            where: { id: u.id },
            data: {
              clockIn: shiftIn,
              clockOut: shiftOut,
              status: "Full_Attend",
            },
          });
          return {
            userId: u.id,
            attend_status: u.status,
            type: "Update",
            shiftIn,
            shiftOut,
          };
        } catch (error) {
          return {
            userId: u.userId,
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            created: false,
          };
        }
      }),
    );
    const processedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          userId: "unknown",
          type: "error",
          error: result.reason,
          created: false,
        };
      }
    });
    const summary = {
      total: users.length,
      Update: processedResults.filter((r) => r.type === "Update").length,
      have: processedResults.filter((r) => r.type === "Have").length,
      failed: processedResults.filter((r) => r.type === "error").length,
      details: processedResults,
    };
    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(error, { status: 400 });
  }
};
export const getShiftIn = async () => {
  try {
    const shift = await db.attendBranch.groupBy({ by: ['clockIn'], orderBy: { clockIn: 'asc' } })
    return shift;
  } catch (error) {
    console.log("🚀 ~ getShiftIn ~ error:", error)
    return null
  }
}
export async function handleClockIn(
  userId: string,
  imgClockIn?: string,
  location?: string,
  notify?: boolean,
  username?: string
): Promise<Response> {
  const today = dayjs();

  // Get shift information
  const shift = await db.attendBranch.findFirst({ where: { userId } });
  if (!shift?.clockIn) {
    throw new Error(`No shift found for user ${userId}`);
  }

  // Check if user is late
  const shiftIn = TimeUtils.createDateFromTimeString(today.toDate(), shift.clockIn, "in");
  const lateThreshold = dayjs(shiftIn).add(659, "second");
  const isLate = today.isAfter(lateThreshold);
  const lateOneHour = dayjs(shiftIn).add(1, 'hour')
  const isToLate = today.isAfter(lateOneHour);
  if (isToLate) {
    return Response.json({ error: "To late clock in" }, { status: 400 });
  }
  let fine: number | null = null;
  if (isLate) {
    let fine200 = branchAssistant.find((e) => e === shift.branch)
    if (fine200) {
      fine = 200;
    } else {
      fine = await getAttendLate(userId, today.month() + 1, today.year());
    }

  }

  // Upload clock-in image
  if (!imgClockIn || !username) {
    return Response.json({ error: "Image or username is missing" }, { status: 400 });
  }

  const imageResult = await postImage(imgClockIn, username, "clock");
  if (imageResult?.error) {
    return Response.json({ error: "Error uploading image" }, { status: 400 });
  }

  // Determine correct date (before 8AM case)
  const isBeforeEightAM = today.isBefore(
    dayjs().tz().hour(8).minute(0).second(0).millisecond(0)
  );
  const attendDate = isBeforeEightAM ? today.add(1, "day").toDate() : today.toDate();

  // Create attendance record
  const attendance = await db.attends.create({
    data: {
      userId,
      dates: attendDate,
      clockIn: today.toISOString(),
      img: imageResult?.success,
      fine: fine,
      locationIn: location || null
    }
  });

  // Send notifications
  await Promise.all([
    notify ? notificationClock(userId, notify) : Promise.resolve(),
    username ? SentNoti("Clock", "You have clocked in", "", username) : Promise.resolve()
  ]);

  return Response.json({ id: attendance.id, timeIn: attendance.clockIn }, { status: 201 });
}

interface AttendanceSalaryData {
  userId: string;
  fineLate: number | null;
  fineNoClockIn: number | null;
  fineNoClockOut: number | null;
  overtimes: number;
  workingHour: number | null;
  add10: number | null
}

export async function handleClockOut(
  userId: string,
  location?: string,
  notify?: boolean,
  username?: string
): Promise<Response> {
  const today = dayjs();

  // Get necessary data
  const [fine, shift] = await Promise.all([
    getNoClockIn(userId, today.month() + 1, today.year()),
    db.attendBranch.findFirst({ where: { userId } })
  ]);

  if (!shift?.clockOut) {
    return Response.json(
      { error: `No shift found for user ${userId}` },
      { status: 400 }
    );
  }

  // Calculate overtime
  const shiftOut = TimeUtils.createDateFromTimeString(today.toDate(), shift.clockOut, "out");
  const overtime = await calculateOvertimeHours(shiftOut, today);
  const overtimeValue = overtime !== null ? Number(overtime) : 0;

  const checkDate = TimeUtils.checkMorning(today.toISOString());
  const attendDate = checkDate ? today.subtract(1, "day").toDate() : today.toDate();

  try {
    // Create attendance record within a transaction
    const attendance = await db.$transaction(async (tx) => {
      const attend = await tx.attends.create({
        data: {
          userId,
          dates: attendDate,
          clockOut: today.toISOString(),
          fine2: fine,
          locationOut: location || null,
          overtime: overtimeValue,
          status: AttendStatus.No_ClockIn_ClockOut
        }
      });

      const salaryData: AttendanceSalaryData = {
        userId,
        fineLate: null,
        fineNoClockIn: fine,
        fineNoClockOut: null,
        overtimes: overtimeValue,
        workingHour: null,
        add10: null
      };

      await CheckSalarys(salaryData);
      await calculateTotalSalaryUser(userId);

      return attend;
    });

    // Send notifications
    if (notify) await notificationClock(userId, notify);
    if (username) await SentNoti("Clock", "You have clocked out", "", username);

    return Response.json({ id: attendance.id, timeOut: attendance.clockOut }, { status: 201 });
  } catch (error) {
    console.log("🚀 ~ error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    await Logging(userId, "Clock out", errorMessage);
    throw error; // Re-throw to be caught by the main try-catch
  }
}

interface NotifyData {
  id: string;
  date: string;
  time: string;
  type: string;
  shiftTime: string;
  smallDate: string;
  clockInLocation?: string;
}

export async function processClockOut(
  userId: string,
  attendance: Attends,
  location?: string,
  notify?: NotifyData
): Promise<Response> {
  const today = dayjs();

  // Get shift information
  const shift = await db.attendBranch.findFirst({ where: { userId } });
  if (!shift?.clockOut || !shift?.branch) {
    throw new Error(`No shift found for user ${userId}`);
  }
  let [hournightshift, minuteNight] = shift.clockOut!.split(':').map(Number);
  let newToday;
  if (hournightshift >= 0 && hournightshift <= 9) {
    newToday = today.subtract(1, "days")
  } else {
    newToday = today
  }
  const shiftOut = TimeUtils.createDateFromTimeString(
    newToday.toDate(),
    shift.clockOut,
    "out"
  );
  let fine200 = branchAssistant.find((e) => e === shift.branch)
  let office = shift.branch == "小off" ? true : false;
  console.log("🚀 ~ office:", office)
  if (attendance === null) {

    return await handleNoClockInCase(userId, attendance, location, today, fine200, shiftOut, office);
  }

  // Handle normal clock out case
  return await handleNormalClockOut(userId, attendance, location, notify!, shiftOut, today, office);
}

async function handleNoClockInCase(
  userId: string,
  attendance: Attends,
  location: string | undefined,
  today: dayjs.Dayjs,
  fine200: string | undefined,
  shiftOut: Date,
  office: boolean
): Promise<Response> {
  console.log("masuk sini ", office)
  // Update attendance record
  const fine2 = await getNoClockIn(userId, new Date().getMonth() + 1, new Date().getFullYear())
  let ot = await calculateOvertimeHours(shiftOut, today)
  if (attendance == null) {
    const result = await db.attends.create({
      data: {
        userId: userId,
        dates: today.toDate(),
        clockOut: today.toISOString(),
        status: AttendStatus.No_ClockIn_ClockOut,
        overtime: ot,
        locationOut: location || null,
        fine2: fine200 ? Number(fine200) : fine2
      }
    });
  } else {
    await db.attends.update({
      where: { id: attendance.id }, data: {
        clockOut: today.toISOString(),
        overtime: ot,
        status: AttendStatus.No_ClockIn_ClockOut,
        locationOut: location || null,
        fine: null,
        fine2: fine200 ? Number(fine200) : fine2
      }
    })
  }

  let add10 = await calculateShiftAllowance(attendance != null ? attendance.clockIn : null, today.toDate(), true)
  console.log("🚀 ~ add10:", add10)
  let newot;
  if (office) {
    console.log("🚀 ~ office:if", office)
    newot = ot * 10
    console.log("🚀 ~ newot:if", newot)
  } else {
    console.log("🚀 ~ add10:if", add10)
    if (add10 == 0) {

      newot = null;
    } else {
      newot = add10
    }
  }
  // Update salary calculations
  const salaryData: AttendanceSalaryData = {
    userId,
    fineLate: null,
    fineNoClockIn: fine200 ? Number(fine200) : fine2,
    fineNoClockOut: null,
    overtimes: ot,
    workingHour: null,
    add10: newot
  };

  await CheckSalarys(salaryData);

  return Response.json({ timeOut: today.toISOString() }, { status: 200 });
}

async function handleNormalClockOut(
  userId: string,
  attendance: Attends,
  location: string | undefined,
  notify: NotifyData,
  shiftOut: Date,
  today: dayjs.Dayjs,
  office: boolean
): Promise<Response> {
  console.log("masuk sana ")
  if (!attendance.clockIn) {
    throw new Error("Clock-in time is missing");
  }

  // Calculate hours and overtime
  const [overtime, workingHour] = await Promise.all([
    calculateOvertimeHours(shiftOut, today),
    calculateWorkingHours(attendance.clockIn, today.toISOString())
  ]);

  const overtimeValue = overtime !== null ? Number(overtime) : 0;

  try {
    // Use a transaction for related operations
    const result = await db.$transaction(async (tx) => {
      // Update attendance record
      const updatedAttendance = await tx.attends.update({
        where: { id: attendance.id },
        data: {
          clockOut: today.toISOString(),
          workingHour: workingHour,
          overtime: overtimeValue,
          locationOut: location || null,
          status: attendance.status == "Half_Day" ? "Half_Day" : attendance.fine ? AttendStatus.Late : AttendStatus.Full_Attend
        }
      });
      let add10 = await calculateShiftAllowance(attendance.clockIn, today.toDate(), true)
      // Update salary calculations
      const salaryData: AttendanceSalaryData = {
        userId,
        fineLate: attendance.status === "Late" ? attendance.fine : null,
        fineNoClockIn: null,
        fineNoClockOut: null,
        overtimes: overtimeValue,
        workingHour: workingHour,
        add10: office ? overtimeValue * 10 : (add10 == 0 ? null : add10)
      };

      await CheckSalarys(salaryData);
      await calculateTotalSalaryUser(userId);

      return updatedAttendance;
    });

    // Send notifications
    const user = await db.user.findFirst({
      where: { id: userId },
      select: { username: true }
    });

    if (notify) await notificationClock(userId, notify);
    if (user?.username) await SentNoti("Clock", "You have clocked out", "", user.username);

    return Response.json({ timeOut: result.clockOut }, { status: 200 });
  } catch (error) {
    // Log specific clock-out errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    await Logging(userId, "Clock out transaction", errorMessage);
    throw error; // Re-throw to be caught by the main try-catch
  }
}
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeInMinutes = parseTimeToMinutes(time);
  const startInMinutes = parseTimeToMinutes(startTime);
  const endInMinutes = parseTimeToMinutes(endTime);
  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
};
const checkShift = (clockIn: string) => {
  if (clockIn) {
    if (isTimeInRange(clockIn, '07:00', '10:00')) {
      return 'morning';
    }

    // Mid shift (中班): 11 AM - 17:00 (5 PM)
    if (isTimeInRange(clockIn, '11:00', '17:00')) {
      return 'afternoon';
    }

    // Night shift (晚班): 7 PM - 10 PM
    if (isTimeInRange(clockIn, '19:00', '22:00')) {
      return 'night';
    }
  }

  return '';
}