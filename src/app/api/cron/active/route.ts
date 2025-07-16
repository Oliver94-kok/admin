import { getNoClockOut } from "@/data/salary";
import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";

interface ProcessingResult {
    success: boolean;
    attendanceId: string;
    userId: string;
    error?: string;
    fine?: number;
}

export const POST = async () => {
    try {
        const activeAttend = await db.attends.findMany({
            where: {
                status: "Active"
            },
            include: {
                users: {
                    include: {
                        AttendBranch: true
                    }
                }
            }
        });

        if (activeAttend.length === 0) {
            return Response.json({
                message: "No active attendance records to process",
                totalProcessed: 0,
                successful: 0,
                failed: 0
            }, { status: 200 });
        }

        const BATCH_SIZE = 5;
        const results: ProcessingResult[] = [];

        for (let i = 0; i < activeAttend.length; i += BATCH_SIZE) {
            const userBatch = activeAttend.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                userBatch.map(async (attendance): Promise<ProcessingResult> => {
                    try {
                        const shift = attendance.users?.AttendBranch;

                        // Validate shift data
                        if (!shift || !shift.clockOut) {
                            console.warn(`Cannot process attendance ${attendance.id} for user ${attendance.userId}: No shift info or clockOut time.`);
                            return {
                                success: false,
                                attendanceId: attendance.id,
                                userId: attendance.userId,
                                error: "Missing shift information or clockOut time"
                            };
                        }

                        const attendanceDate = dayjs(attendance.dates);
                        const [outHour, outMinute] = shift.clockOut.split(":").map(Number);

                        // Validate time format
                        // if (isNaN(outHour) || isNaN(outMinute) || outHour < 0 || outHour > 23 || outMinute < 0 || outMinute > 59) {
                        //     console.warn(`Invalid clockOut time format for attendance ${attendance.id}: ${shift.clockOut}`);
                        //     return {
                        //         success: false,
                        //         attendanceId: attendance.id,
                        //         userId: attendance.userId,
                        //         error: "Invalid clockOut time format"
                        //     };
                        // }

                        // Calculate shift out time (handle overnight shifts)
                        let shiftOutTime;
                        if (outHour >= 0 && outHour <= 9) {
                            // Overnight shift - add 1 day
                            shiftOutTime = attendanceDate.hour(outHour).minute(outMinute).add(1, 'day');
                            console.log("🚀 ~ Overnight shift end time:", shiftOutTime.format());
                        } else {
                            // Same day shift
                            shiftOutTime = attendanceDate.hour(outHour).minute(outMinute);
                            console.log("🚀 ~ Same day shift end time:", shiftOutTime.format());
                        }

                        const overtimeEndTime = shiftOutTime.add(4, "hour"); // 4-hour overtime buffer
                        const now = dayjs();

                        // Check if attendance should be marked as stale
                        if (now.isAfter(overtimeEndTime)) {
                            const fine = await getFineForNoClockOut(
                                attendance.userId,
                                shift.branch,
                                attendanceDate.toDate()
                            );

                            await db.attends.update({
                                where: { id: attendance.id },
                                data: {
                                    status: AttendStatus.No_ClockIn_ClockOut,
                                    fine2: fine
                                },
                            });

                            console.log(`Updated attendance ${attendance.id} with fine: ${fine}`);

                            return {
                                success: true,
                                attendanceId: attendance.id,
                                userId: attendance.userId,
                                fine
                            };
                        } else {
                            // Not yet stale
                            return {
                                success: true,
                                attendanceId: attendance.id,
                                userId: attendance.userId,
                                error: "Not yet past overtime window"
                            };
                        }
                    } catch (error) {
                        console.error(`Error processing attendance ${attendance.id}:`, error);
                        return {
                            success: false,
                            attendanceId: attendance.id,
                            userId: attendance.userId,
                            error: error instanceof Error ? error.message : "Unknown error"
                        };
                    }
                })
            );

            // Process batch results
            for (const result of batchResults) {
                if (result.status === "fulfilled") {
                    results.push(result.value);
                } else {
                    console.error("Batch processing error:", result.reason);
                    results.push({
                        success: false,
                        attendanceId: "unknown",
                        userId: "unknown",
                        error: result.reason instanceof Error ? result.reason.message : "Promise rejected"
                    });
                }
            }

            // Add delay between batches to prevent overwhelming the database
            if (i + BATCH_SIZE < activeAttend.length) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        // Calculate summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const totalFines = results
            .filter(r => r.success && r.fine !== undefined)
            .reduce((sum, r) => sum + (r.fine || 0), 0);

        const summary = {
            totalProcessed: results.length,
            successful,
            failed,
            totalFines,
            details: results
        };

        console.log("Processing summary:", summary);
        return Response.json(summary, { status: 200 });

    } catch (error) {
        console.error("Failed to process attendance:", error);
        return Response.json({
            error: "Failed to process attendance",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
};

async function getFineForNoClockOut(
    userId: string,
    branch: string | null | undefined,
    date: Date
): Promise<number> {
    try {
        const isAssistantBranch = branchAssistant.find((b) => b === branch);
        if (isAssistantBranch) {
            return 200;
        }

        const fine = await getNoClockOut(userId, date.getMonth() + 1, date.getFullYear());
        // Handle null case - return default fine if getNoClockOut returns null
        return fine ?? 200;
    } catch (error) {
        console.error(`Error calculating fine for user ${userId}:`, error);
        // Return default fine in case of error
        return 200;
    }
}