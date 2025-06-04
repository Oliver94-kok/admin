import { calculateOvertimeHours, calculateWorkingHours } from "@/data/attend";
import { CheckSalarys, getAttendLate, getNoClockOut } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { Attends, AttendStatus, User } from "@prisma/client";
import dayjs from "dayjs";
export const dynamic = "force-dynamic";
export const GET = async () => {
    let users = await db.user.findMany({ where: { role: "USER", isDelete: false } });
    let today = dayjs().startOf("month");
    console.log("🚀 ~ GET ~ today:", today);
    let yesterday = dayjs().subtract(1, "day");
    console.log("🚀 ~ GET ~ yesterday:", yesterday);
    if (users) {
        const processResults = await Promise.allSettled(
            users.map(async (user) => {
                let salary = await db.salary.findFirst({
                    where: { userId: user.id, month: 12, year: 2024 },
                });
                let attends = await db.attends.findMany({
                    where: {
                        userId: user.id,
                        dates: {
                            gte: new Date(today.format("YYYY-MM-DD")),
                            lte: new Date(yesterday.format("YYYY-MM-DD")),
                        },
                    },
                });
                let totaldays = attends.length;
                let totalFine = 0;
                let totalFine2 = 0;
                let totalOvertime = 0;
                let totalWorkinghour = 0;
                attends.map((a) => {
                    totalOvertime = totalOvertime + a.overtime!;
                    totalWorkinghour = totalWorkinghour + a.workingHour!;

                    if (a.status == "No_ClockIn_ClockOut") {
                        totalFine2 = totalFine2 + a.fine!;
                    } else if (a.status == "Late") {
                        totalFine = totalFine + a.fine!;
                    }
                });
                await db.salary.update({
                    where: { id: salary?.id },
                    data: {
                        workingDay: totaldays,
                        fineLate: totalFine,
                        fineNoClockIn: totalFine2,
                        workingHoour: totalWorkinghour,
                        overTimeHour: totalOvertime,
                    },
                });
            }),
        );
    }

    return Response.json({ users }, { status: 200 });
};


interface ProcessResult {
    userId: string;
    type: 'success' | 'error';
    error?: string;
    created: boolean;
}

interface SalaryUpdateData {
    userId: string;
    fineLate: number | null;
    fineNoClockIn: number | null;
    fineNoClockOut: number | null;
    overtimes: number | null;
    workingHour: number | null;
    add10: number | null
}

interface Summary {
    total: number;
    total2: number;
    successful: number;
    success2: number;
    failed: number;
    fail2: number;
    details: ProcessResult[];
}

export const POST = async (req: Request) => {
    try {
        const today = dayjs().subtract(1, 'days');
        const formattedDate = today.format('YYYY-MM-DD');
        const todayDate = new Date(formattedDate);

        // Get all users and attendances in parallel to save time
        const [users, allAttendances, activeAttendances, NoClockInorOut] = await Promise.all([
            db.user.findMany({ where: { role: "USER", isDelete: false } }) as Promise<User[]>,
            db.attends.findMany({ where: { dates: todayDate } }) as Promise<Attends[]>,
            db.attends.findMany({ where: { dates: todayDate, status: "Active" } }) as Promise<Attends[]>,
            db.attends.findMany({ where: { dates: todayDate, clockIn: null, clockOut: null, status: "No_ClockIn_ClockOut" } }) as Promise<Attends[]>
        ]);

        // Create a Set of user IDs who already have attendance records
        const attendedUserIds = new Set(
            allAttendances.map(attend => attend.userId)
        );

        // Filter users who don't have attendance records
        const absentUsers = users.filter(user => !attendedUserIds.has(user.id));

        // Process absent users
        const absentProcessResults = await processAbsentUsers(absentUsers, todayDate);
        //Process check no clock in or out 
        await processNoClockInorOut(NoClockInorOut,)
        // Process active users who didn't clock out
        const activeProcessResults = await processActiveAttendances(activeAttendances);

        // Generate summary
        const summary = generateSummary(users.length, activeAttendances.length, absentProcessResults, activeProcessResults);

        return Response.json(summary, { status: 200 });
    } catch (error) {
        console.error("Attendance processing error:", error);
        return Response.json({ error: "Failed to process attendance" }, { status: 500 });
    }
};

/**
 * Process users who were absent and create attendance records for them
 */
async function processAbsentUsers(absentUsers: User[], todayDate: Date): Promise<PromiseSettledResult<ProcessResult>[]> {
    return Promise.allSettled(
        absentUsers.map(async (user) => {
            try {
                let attend = await db.attends.findFirst({ where: { userId: user.id, dates: todayDate } })
                if (attend) throw new Error("existing data")
                await db.attends.create({
                    data: {
                        dates: todayDate,
                        userId: user.id,
                        status: AttendStatus.Absent
                    }
                });

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

/**
 * Process users who were absent and create attendance records for them
 */
async function processNoClockInorOut(absentUsers: Attends[],): Promise<PromiseSettledResult<ProcessResult>[]> {
    return Promise.allSettled(
        absentUsers.map(async (user) => {
            try {

                await db.attends.update({ where: { id: user.id }, data: { status: "Absent", fine: null, fine2: null } })
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

/**
 * Process active attendances that need to be updated
 */
async function processActiveAttendances(activeAttendances: Attends[]): Promise<PromiseSettledResult<ProcessResult>[]> {
    return Promise.allSettled(
        activeAttendances.map(async (attend) => {
            try {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();

                const fine2 = await getNoClockOut(
                    attend.userId,
                    currentMonth,
                    currentYear
                );

                // Update the attendance record
                await db.attends.update({
                    where: { id: attend.id },
                    data: { status: attend.fine ? "No_clockIn_ClockOut_Late" : "No_ClockIn_ClockOut", fine2 }
                });

                // Update salary information
                await CheckSalarys({
                    userId: attend.userId,
                    fineLate: attend.fine ? attend.fine : null,
                    fineNoClockIn: fine2,
                    fineNoClockOut: null,
                    overtimes: null,
                    workingHour: null,
                } as SalaryUpdateData);

                return {
                    userId: attend.userId,
                    type: 'success' as const,
                    created: true,
                };
            } catch (error) {
                return {
                    userId: attend.userId,
                    type: 'error' as const,
                    error: error instanceof Error ? error.message : "Unknown error",
                    created: false,
                };
            }
        })
    );
}

/**
 * Process results from Promise.allSettled
 */
function processResults(results: PromiseSettledResult<ProcessResult>[]): ProcessResult[] {
    return results.map(result => {
        if (result.status === "fulfilled") {
            return result.value;
        } else {
            return {
                userId: "unknown",
                type: 'error' as const,
                error: String(result.reason),
                created: false,
            };
        }
    });
}

/**
 * Generate summary of processing results
 */
function generateSummary(
    totalUsers: number,
    totalActiveAttendances: number,
    absentResults: PromiseSettledResult<ProcessResult>[],
    activeResults: PromiseSettledResult<ProcessResult>[]
): Summary {
    const processedAbsentResults = processResults(absentResults);
    const processedActiveResults = processResults(activeResults);

    return {
        total: totalUsers,
        total2: totalActiveAttendances,
        successful: processedAbsentResults.filter(r => r.type === "success").length,
        success2: processedActiveResults.filter(r => r.type === "success").length,
        failed: processedAbsentResults.filter(r => r.type === "error").length,
        fail2: processedActiveResults.filter(r => r.type === "error").length,
        details: processedAbsentResults.filter(r => r.type === "success"),
    };
}