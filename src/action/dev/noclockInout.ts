'use server'

import { db } from "@/lib/db"



export const noClockInOutLate = async () => {
    try {
        const result = await db.attends.findMany({
            where: {
                clockIn: null,
                clockOut: null,
                status: {
                    in: ["No_ClockIn_ClockOut", "No_clockIn_ClockOut_Late"]
                }
            }
        })
        const BATCH_SIZE = 5;
        const results = [];
        for (let i = 0; i < result.length; i += BATCH_SIZE) {
            const userBatch = result.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                userBatch.map(async (a) => {
                    try {
                        await db.attends.update({
                            where: { id: a.id }, data: {
                                status: "Absent",
                                fine: null,
                                fine2: null,
                            }
                        })
                        return {
                            userId: a.userId,
                            success: true,
                        };
                    } catch (err) {
                        const error = err as Error;
                        console.error(`Error processing user ${a.userId}:`, error);
                        return {
                            userId: a.userId,
                            error: error.message || "Unknown error occurred",
                            success: false,
                        };
                    }

                })
            )

            results.push(...batchResults);

            if (i + BATCH_SIZE < result.length) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        const summary = {
            totalProcessed: results.length,
            successful: results.filter(
                (r) => r.status === "fulfilled" && r.value.success,
            ).length,
            failed: results.filter((r) => r.status === "rejected" || !r.value.success)
                .length,
            details: results.map((r) =>
                r.status === "fulfilled" ? r.value : { error: r.reason },
            ),
        };

        console.log("🚀 ~ noClockInOutLate ~ result:", result.length)
        return { success: "Success update data", result }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}