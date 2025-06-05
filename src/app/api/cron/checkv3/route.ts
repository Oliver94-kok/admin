import { isOffDay } from "@/data/attend";
import { db } from "@/lib/db"
import { TimeUtils } from "@/lib/timeUtility";
import { Attends, AttendStatus, User } from "@prisma/client";
import dayjs from "dayjs";


interface ProcessResult {
    userId: string;
    type: 'success' | 'error';
    error?: string;
    created: boolean;
}

export const POST = async () => {
    try {
        const today = dayjs()
        const formattedDate = today.format('YYYY-MM-DD');
        const todayDate = new Date(formattedDate);
        const [users, allAttendances, activeAttendances, NoClockInorOut] = await Promise.all([
            db.user.findMany({ where: { role: "USER", isDelete: false } }) as Promise<User[]>,
            db.attends.findMany({ where: { dates: todayDate } }) as Promise<Attends[]>,
            db.attends.findMany({ where: { dates: todayDate, status: "Active" } }) as Promise<Attends[]>,
            db.attends.findMany({ where: { dates: todayDate, clockIn: null, clockOut: null, status: "No_ClockIn_ClockOut" } }) as Promise<Attends[]>
        ]);
        const attendedUserIds = new Set(
            allAttendances.map(attend => attend.userId)
        );

        // Filter users who don't have attendance records
        const absentUsers = users.filter(user => !attendedUserIds.has(user.id));
        return Response.json({ absentUsers, activeAttendances, NoClockInorOut }, { status: 200 })
    } catch (error) {
        return Response.json(error, { status: 400 })
    }
}
/**
 * Process users who were absent and create attendance records for them
 */
async function processAbsentUsers(absentUsers: User[], todayDate: Date): Promise<PromiseSettledResult<ProcessResult>[]> {
    return Promise.allSettled(
        absentUsers.map(async (user) => {
            try {
                const shift = await db.attendBranch.findFirst({
                    where: { userId: user.id },
                    select: {
                        clockIn: true,
                        clockOut: true,
                        offDay: true,
                    },
                });
                if (!shift?.clockIn || !shift?.clockOut) {
                    throw new Error(`No shift found for user ${user.id}`);
                }
                if (shift.offDay) {
                    let day = shift.offDay.split(",");
                    let resultOffDay = await isOffDay(day, "TODAY");
                    if (resultOffDay) {
                        let data = {
                            userId: user.id,
                            dates: todayDate,
                            status: AttendStatus.OffDay,
                        };
                        await db.attends.create({ data });
                        return {
                            userId: user.id,
                            type: 'success' as const,
                            created: true,
                        };
                    }
                }

                return {
                    userId: user.id,
                    type: 'success' as const,
                    created: true,
                };
            } catch (error) {
                return {
                    userId: user.id,
                    type: 'error' as const,
                    error: error instanceof Error ? error.message : "Unknown error",
                    created: false,
                };
            }
        })
    );
}
const checkShift = async (shiftIn: string, shiftOut: string) => {
    try {
        const [hourIn, minuteIn] = shiftIn.split(":").map(Number);
        const [hourOut, minuteOut] = shiftOut.split(":").map(Number);
        const dateTime = dayjs();
        const newshiftIn = dateTime.add(hourIn, 'hour').add(minuteIn, 'minute');
        const newshiftOut = dateTime.add(hourOut, 'hour').add(minuteOut, 'minute');

    } catch (error) {
        return null
    }
}