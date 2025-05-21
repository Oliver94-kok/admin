import { ApproveLeaveV2 } from "@/action/approveLeave_v2";
import { db } from "@/lib/db";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// Extend dayjs with required plugins
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export const GET = async () => {
    try {
        const leave = await db.leave.findMany({
            where: {
                status: "Approve", createdAt: {
                    gte: new Date('2025-05-01'),
                    lte: new Date('2025-05-20')
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
function formatWithDayjs(input: string): string | null {
    if (!input) return null;

    const formats = ['DD-MM-YYYY hh:mm A', 'YYYY-MM-DD hh:mm A'];

    for (const format of formats) {
        const date = dayjs(input, format);
        if (date.isValid()) {
            return date.format('YYYY-MM-DD HH:mm');
        }
    }

    return null;
}

interface Leave {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
}

export const POST = async (req: Request) => {
    try {
        const { userId } = await req.json();
        if (!userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        const leaves = await db.leave.findMany();

        if (!leaves || leaves.length === 0) {
            return Response.json({ error: "No leaves found" }, { status: 404 });
        }

        const BATCH_SIZE = 5;
        const results = [];

        for (let i = 0; i < leaves.length; i += BATCH_SIZE) {
            const batch = leaves.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                batch.map(async (leave: Leave) => {
                    try {
                        const startDate = formatWithDayjs(leave.startDate);
                        const endDate = formatWithDayjs(leave.endDate);

                        if (!startDate || !endDate) {
                            throw new Error("Invalid date format");
                        }
                        await db.leave.update({ where: { id: leave.id }, data: { startDate: startDate, endDate: endDate } })
                        return {
                            userId: leave.userId,
                            leaveId: leave.id,
                            startDate,
                            endDate,
                            success: true
                        };
                    } catch (err) {
                        const error = err as Error;
                        console.error(`Error processing leave ${leave.id}:`, error);
                        return {
                            userId: leave.userId,
                            leaveId: leave.id,
                            error: error.message || "Unknown error occurred",
                            success: false,
                        };
                    }
                })
            );

            results.push(...batchResults);

            // Only add delay if not the last batch
            if (i + BATCH_SIZE < leaves.length) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        const successful = results.filter(
            (r) => r.status === "fulfilled" && r.value.success
        );

        const failed = results.filter(
            (r) => r.status === "rejected" || !r.value?.success
        );

        const summary = {
            totalProcessed: results.length,
            successful: successful.length,
            failed: failed.length,
            details: results.map((r) =>
                r.status === "fulfilled" ? r.value : { error: r.reason }
            ),
        };

        return Response.json(summary, { status: 200 });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};