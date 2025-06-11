import { ApproveLeaveV2 } from "@/action/approveLeave_v2";
import { db } from "@/lib/db";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { leaveTypeMap } from "@/types/leave";
import { getDataBranch } from "@/data/branch";
import { branchAssistant } from "@/types/branchs";

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
        const branchs = await db.attendBranch.findMany({
            where: {
                branch: { in: branchAssistant },
                users: { isDelete: false }
            }
        })
        const BATCH_SIZE = 5;
        const results = [];
        for (let i = 0; i < branchs.length; i += BATCH_SIZE) {
            const userBatch = branchs.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                userBatch.map(async (b) => {
                    try {
                        const attends = await db.attends.findMany({
                            where: {
                                dates: { gte: new Date('2025-06-01'), lte: new Date("2025-06-30") }
                            }
                        })
                        attends.map(async (a) => {
                            if (a.status == "No_ClockIn_ClockOut") {
                                await db.attends.update({ where: { id: a.id }, data: { fine2: 200, fine: null } })
                            } else if (a.status == "No_clockIn_ClockOut_Late") {
                                await db.attends.update({ where: { id: a.id }, data: { fine2: 200, fine: 200 } })
                            } else if (a.status == "Late") {
                                await db.attends.update({ where: { id: a.id }, data: { fine: 200, fine2: null } })
                            }
                        })
                        return {
                            userId: b.userId,
                            success: true,
                        };
                    } catch (err) {
                        const error = err as Error;
                        console.error(`Error processing user ${b.userId}:`, error);
                        return {
                            userId: b.userId,
                            error: error.message || "Unknown error occurred",
                            success: false,
                        };
                    }

                })
            )

            results.push(...batchResults);

            if (i + BATCH_SIZE < branchs.length) {
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
        console.error("Error in POST handler:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};