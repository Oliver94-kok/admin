import { ApproveLeaveV2 } from "@/action/approveLeave_v2";
import { db } from "@/lib/db";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { leaveTypeMap } from "@/types/leave";
import { getDataBranch } from "@/data/branch";

// Extend dayjs with required plugins
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export const GET = async () => {
    try {
        const leave = await db.leave.findMany({
            where: {
                createdAt: {
                    gte: new Date('2025-01-01'),
                    lte: new Date('2025-08-31')
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })
        const BATCH_SIZE = 3;
        const results = [];
        for (let i = 0; i < leave.length; i += BATCH_SIZE) {
            const userBatch = leave.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                userBatch.map(async (a) => {
                    try {
                        const englishType = leaveTypeMap[a.type] || "Unknown leave type";
                        const result = await db.leave.update({ where: { id: a.id }, data: { type: englishType } });
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
        let data = await getDataBranch("All")
        return Response.json(data, { status: 200 });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};