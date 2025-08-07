'use server';

import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";

// Constants for fine amounts to improve readability and maintainability
const LATE_FINE_FIRST = 50;
const LATE_FINE_SUBSEQUENT = 100;
const NO_CLOCK_FINE_FIRST = 50;
const NO_CLOCK_FINE_SUBSEQUENT = 100;
const SHIFT_WORKER_FINE = 200;

// Constants for batch processing
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;

/**
 * Calculates and applies fines for all users based on their attendance
 * records within a given date range.
 */
export const calFineUser = async (startDate: Date, endDate: Date) => {
    try {
        const teams = ["A", "B", "C", "D", "E", "SW", "Ocean", "Office"];
        // Process all teams concurrently and wait for all promises to resolve.
        await Promise.all(teams.map(team => fineUserForTeam(team, startDate, endDate)));

        return { success: "Successfully calculated fines for all teams." };
    } catch (error) {
        console.error("🚀 ~ calFineUser ~ error:", error);
        // Return a structured error message that is safe to pass to the client.
        return { error: "An unexpected error occurred while calculating fines." };
    }
};

/**
 * Fetches users for a specific team and processes their fines in batches.
 */
const fineUserForTeam = async (team: string, startDate: Date, endDate: Date) => {
    const users = await db.user.findMany({
        where: {
            role: "USER",
            isDelete: false,
            AttendBranch: { team }
        },
        // Only select the 'id' field as it's the only one needed.
        select: { id: true }
    });

    // Process users in batches to avoid overwhelming the database.
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const userBatch = users.slice(i, i + BATCH_SIZE);

        // Process each user in the current batch concurrently.
        await Promise.all(userBatch.map(user => processUserFines(user.id, startDate, endDate)));

        // Add a delay between batches to throttle the load on the database.
        if (i + BATCH_SIZE < users.length) {
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
    }
};

/**
 * Processes attendance records and applies fines for a single user.
 */
const processUserFines = async (userId: string, startDate: Date, endDate: Date) => {
    const attends = await db.attends.findMany({
        where: {
            userId,
            dates: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        // Process attendance chronologically to ensure correct fine calculation.
        orderBy: {
            dates: 'asc'
        }
    });
    const shift = await db.attendBranch.findFirst({
        where: { userId, branch: { in: branchAssistant } }
    });
    let lateCount = 0;
    let noClockCount = 0;

    // Use a sequential for...of loop to ensure counters are updated correctly.
    for (const attend of attends) {
        const isLate = attend.status === "Late" || attend.status === "Half_Day_Late" || attend.status === "No_clockIn_ClockOut_Late";
        const isNoClock = attend.status === "No_ClockIn_ClockOut" || attend.status === "Half_Day_NoClockIn_Out";

        let targetFine: number | null = null;
        let targetFine2: number | null = null;

        if (isLate) {
            lateCount++;
            const fineAmount = lateCount <= 1 ? LATE_FINE_FIRST : LATE_FINE_SUBSEQUENT;
            targetFine = shift ? SHIFT_WORKER_FINE : fineAmount;
            targetFine2 = null; // Ensure other fine type is cleared
        } else if (isNoClock) {
            noClockCount++;
            const fineAmount = noClockCount <= 1 ? NO_CLOCK_FINE_FIRST : NO_CLOCK_FINE_SUBSEQUENT;
            targetFine2 = shift ? SHIFT_WORKER_FINE : fineAmount;
            targetFine = null; // Ensure other fine type is cleared
        } else {
            // For any other status, ensure both fines are cleared.
            targetFine = null;
            targetFine2 = null;
        }

        // Only perform a database write if the fine values have actually changed.
        if (attend.fine !== targetFine || attend.fine2 !== targetFine2) {
            await db.attends.update({
                where: { id: attend.id },
                data: {
                    fine: targetFine,
                    fine2: targetFine2,
                },
            });
        }
    }
};
