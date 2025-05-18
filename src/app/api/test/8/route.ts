import { ApproveLeaveV2 } from "@/action/approveLeave_v2";
import { db } from "@/lib/db";


export const GET = async () => {
    try {
        const leave = await db.leave.findMany({
            where: {
                status: "Approve", createdAt: {
                    gte: new Date('2025-05-01'),
                    lte: new Date('2025-05-17')
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })
        const BATCH_SIZE = 5;
        const results = [];
        for (let i = 0; i < leave.length; i += BATCH_SIZE) {
            const userBatch = leave.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                userBatch.map(async (a) => {
                    try {
                        const result = ApproveLeaveV2("Approve", a.id)
                        return {
                            userId: a.userId,
                            success: true,
                            result
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

            if (i + BATCH_SIZE < leave.length) {
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

        return Response.json(summary, { status: 200 })
    } catch (error) {
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}