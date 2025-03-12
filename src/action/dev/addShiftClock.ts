import { db } from "@/lib/db"
import { TimeUtils } from "@/lib/timeUtility"
import { AttendStatus } from "@prisma/client"

interface AddClockByShiftProps {
    shift: string
    date: string
}

export const addClockByShift = async ({ shift, date }: AddClockByShiftProps) => {
    try {
        // Validate inputs
        if (!shift || !date) {
            throw new Error("Shift and date are required")
        }

        // Parse date once
        const attendDate = new Date(date)
        if (isNaN(attendDate.getTime())) {
            throw new Error("Invalid date format")
        }

        // Find users in the specified shift
        const users = await db.user.findMany({
            where: {
                role: "USER",
                AttendBranch: { clockIn: shift }
            },
            select: { id: true } // Only select necessary fields
        })

        if (!users.length) {
            throw new Error(`No users found in shift: ${shift}`)
        }

        const BATCH_SIZE = 5; // Increased from 3 for better performance
        const results = [];

        // Process in batches
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const userBatch = users.slice(i, i + BATCH_SIZE);
            const shiftInTime = TimeUtils.createDateFromTimeString(
                attendDate,
                shift,
                "in"
            );

            // Create attendance records in bulk when possible
            const batchResults = await Promise.allSettled(
                userBatch.map(async (user) => {
                    try {
                        const data = {
                            userId: user.id,
                            clockIn: shiftInTime,
                            dates: attendDate,
                            status: AttendStatus.Active
                        }
                        let attends = await db.attends.findFirst({ where: { dates: attendDate, userId: user.id } })
                        if (attends) throw new Error("User already has an attendance record for this date")
                        await db.attends.create({ data })

                        return {
                            userId: user.id,
                            success: true,
                        };
                    } catch (err) {
                        console.error(`Error creating attendance for user ${user.id}:`, err);
                        const error = err as Error;

                        return {
                            userId: user.id,
                            error: error.message || "Unknown error occurred",
                            success: false,
                        };
                    }
                })
            );

            results.push(...batchResults);

            // Add delay between batches to prevent overloading the database
            if (i + BATCH_SIZE < users.length) {
                await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced from 1000ms
            }
        }

        // Count successes and failures
        const successCount = results.filter(result =>
            result.status === "fulfilled" && result.value.success
        ).length;

        const failureCount = results.length - successCount;

        return {
            success: true,
            message: `Successfully added ${successCount} attendance records${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
            results
        };
    } catch (error) {
        console.error("Error in addClockByShift:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred"
        };
    }
}