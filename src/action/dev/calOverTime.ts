'use server';

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// It's better to configure dayjs in a single file (e.g., lib/dayjs.ts) and import it.
// This avoids side effects and ensures consistency.
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// --- Configuration Constants ---
const OFFICE_BRANCH_NAME = "小off";
const NIGHT_SHIFT_TEAMS = ['A', 'B', 'C', 'D', 'E', 'SW', 'Ocean'];
const BATCH_SIZE = 10; // For processing users in chunks to avoid overwhelming the DB
const LOCAL_TIMEZONE = 'Asia/Kuala_Lumpur';
const OFFICE_WORK_HOURS = 6;
const OFFICE_OVERTIME_RATE = 10; // Currency per hour

/**
 * Main function to trigger overtime calculation for different employee types.
 * @param type - The type of employees to calculate overtime for ("Office" or "nightshift").
 * @param startDate - The start date of the calculation period.
 * @param endDate - The end date of the calculation period.
 */
export const CalculateOverTime = async (type: "nightshift" | "Office", startDate: Date, endDate: Date) => {
    try {
        if (type === "Office") {
            await officeOvertime(startDate, endDate);
        } else {
            // Use Promise.all to ensure all team calculations are awaited.
            await Promise.all(
                NIGHT_SHIFT_TEAMS.map(team => nightshift(startDate, endDate, team))
            );
        }
        return { success: "Overtime calculation completed successfully." };
    } catch (error) {
        console.error("Failed to calculate overtime:", error);
        // Return a more informative error message
        return { error: error instanceof Error ? error.message : "An unknown error occurred." };
    }
};

/**
 * Calculates and updates overtime for office staff.
 * This function is optimized to reduce database queries.
 */
const officeOvertime = async (startDate: Date, endDate: Date) => {
    const users = await db.user.findMany({
        where: {
            role: "USER",
            isDelete: false,
            AttendBranch: { branch: OFFICE_BRANCH_NAME }
        },
        select: { id: true }
    });

    const userIds = users.map(u => u.id);

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
        const batchUserIds = userIds.slice(i, i + BATCH_SIZE);

        const attends = await db.attends.findMany({
            where: {
                userId: { in: batchUserIds },
                dates: { gte: startDate, lte: endDate }
            }
        });

        // Calculate overtime for each attendance record and aggregate per user.
        const userOvertimeMap = new Map<string, number>();
        const attendOvertimeData = attends.map(attend => ({
            attendId: attend.id,
            userId: attend.userId,
            overtimeHours: calculateOfficeOvertimeHours(attend.clockIn, attend.clockOut)
        }));

        for (const data of attendOvertimeData) {
            const currentOvertime = userOvertimeMap.get(data.userId) || 0;
            userOvertimeMap.set(data.userId, currentOvertime + data.overtimeHours);
        }

        // Use an interactive transaction for atomic updates.
        await db.$transaction(async (tx) => {
            const allPromises: Promise<any>[] = [];

            // Create promises to update individual attendance records.
            for (const { attendId, overtimeHours } of attendOvertimeData) {
                if (overtimeHours > 0) {
                    allPromises.push(
                        tx.attends.update({
                            where: { id: attendId },
                            data: { overtime: overtimeHours }
                        })
                    );
                }
            }

            // Create promises to update salary records with aggregated overtime.
            for (const [userId, totalOvertime] of Array.from(userOvertimeMap.entries())) {
                if (totalOvertime > 0) {
                    allPromises.push(
                        tx.salary.updateMany({
                            where: {
                                userId: userId,
                                month: startDate.getMonth() + 1,
                                year: startDate.getFullYear()
                            },
                            data: {
                                overTimeHour: totalOvertime,
                                overTime: totalOvertime * OFFICE_OVERTIME_RATE
                            }
                        })
                    );
                }
            }

            if (allPromises.length > 0) {
                await Promise.all(allPromises);
            }
        });
    }
};

/**
 * Calculates overtime hours for an office shift based on clock-in and clock-out times.
 * @param clockIn - The clock-in time.
 * @param clockOut - The clock-out time.
 * @returns The calculated overtime in hours.
 */
const calculateOfficeOvertimeHours = (clockIn: Date | null, clockOut: Date | null): number => {
    if (!clockOut) return 0; // No clock-out means no overtime.

    // If no clock-in, assume a standard work duration leading up to clock-out.
    const effectiveClockIn = clockIn ? dayjs(clockIn) : dayjs(clockOut).subtract(OFFICE_WORK_HOURS, 'hour');

    const workedHours = dayjs(clockOut).diff(effectiveClockIn, 'hour', true);
    const overtimeHours = workedHours - OFFICE_WORK_HOURS;

    // Business logic: Round up only if overtime is at least 54 minutes (0.9 * 60).
    const decimalPart = overtimeHours % 1; // Extract decimal (e.g., 2.95 → 0.95)
    const roundedOvertime = decimalPart >= 0.9 ? Math.ceil(overtimeHours) : Math.floor(overtimeHours);

    return roundedOvertime >= 1 ? roundedOvertime : 0;
};

/**
 * Calculates and updates overtime bonuses for night shift teams.
 * This function is optimized to reduce database queries.
 */
const nightshift = async (startDate: Date, endDate: Date, team: string) => {
    // Corrected: isDelete should be false to calculate for active users.
    const users = await db.user.findMany({
        where: {
            role: "USER",
            isDelete: false,
            AttendBranch: { team }
        },
        select: { id: true }
    });

    if (users.length === 0) return;

    const userIds = users.map(u => u.id);
    const attends = await db.attends.findMany({
        where: {
            userId: { in: userIds },
            dates: { gte: startDate, lte: endDate },
            NOT: {
                OR: [{ status: "Leave" }, { status: "Active" }, { status: "Absent" }],
            },
        }
    });

    const userBonusMap = new Map<string, number>();
    for (const attend of attends) {
        const bonus = getNightShiftBonus(attend.clockIn, attend.clockOut);
        const currentBonus = userBonusMap.get(attend.userId) || 0;
        userBonusMap.set(attend.userId, currentBonus + bonus);
    }

    const salaryUpdatePromises: Prisma.PrismaPromise<any>[] = Array.from(userBonusMap.entries()).map(([userId, totalBonus]) => {
        return db.salary.updateMany({
            where: {
                userId: userId,
                month: startDate.getMonth() + 1,
                year: startDate.getFullYear()
            },
            data: {
                overTime: totalBonus // Assuming 'overTime' field stores the bonus amount
            }
        });
    });

    if (salaryUpdatePromises.length > 0) {
        await db.$transaction(salaryUpdatePromises);
    }
};

/**
 * Determines the night shift bonus based on clock-in or clock-out times.
 * This is not a calculation of hours, but a fixed bonus amount.
 * @returns A bonus amount (e.g., 10 or 5) or 0.
 */
const getNightShiftBonus = (clockIn: Date | null, clockOut: Date | null): number => {
    const GRACE_PERIOD_MINUTES = 15;

    // --- 1. Check Clock-In Time First ---
    if (clockIn) {
        const inTime = dayjs(clockIn).tz(LOCAL_TIMEZONE);
        // Shift starts at 5:00 PM (17:00)
        const shift17Start = inTime.clone().hour(17).minute(0).second(0);
        // Earlier shift starts at 3:00 PM (15:00)
        const shift15Start = inTime.clone().hour(15).minute(0).second(0);
        const endOfCheckInWindow = inTime.clone().hour(23).minute(0).second(0);

        const earliestForShift17 = shift17Start.subtract(GRACE_PERIOD_MINUTES, 'minute');
        const earliestForShift15 = shift15Start.subtract(GRACE_PERIOD_MINUTES, 'minute');

        // Bonus for 5 PM shift
        if (inTime.isSameOrAfter(earliestForShift17) && inTime.isBefore(endOfCheckInWindow)) {
            return 10;
        }
        // Bonus for 3 PM shift
        if (inTime.isSameOrAfter(earliestForShift15) && inTime.isBefore(earliestForShift17)) {
            return 5;
        }
    }

    // --- 2. If No Clock-In Match, Check Clock-Out Time ---
    if (clockOut) {
        const outTime = dayjs(clockOut).tz(LOCAL_TIMEZONE);
        // Window for night shift clock-out is between 3:00 AM and 11:00 AM
        const earliestOut = outTime.clone().hour(3).minute(0).second(0);
        const latestOut = outTime.clone().hour(11).minute(0).second(0);

        if (outTime.isSameOrAfter(earliestOut) && outTime.isBefore(latestOut)) {
            return 10;
        }
    }

    // --- 3. Default: No bonus ---
    return 0;
};