'use server'

import { db } from "@/lib/db"
import { branchAssistant } from "@/types/branchs"
import { leaveType } from "@/types/leave"
import dayjs from "dayjs"

interface salaryCalProps {
    team: string
    month: string
    year: string
}
export const SalaryCal = async ({ team, year, month }: salaryCalProps) => {
    try {
        if (!team || !year || !month) {
            return { error: "Missing required parameters: team, year, or month" };
        }
        if (!dayjs(`${year}-${month}-01`).isValid()) {
            return { error: "Invalid date format" };
        }
        const users = await db.user.findMany({ where: { role: "USER", AttendBranch: { team } } })
        const BATCH_SIZE = 3;
        const results = [];
        const startDate = dayjs(`${year}-${month}-01`).startOf('month');
        const endDate = dayjs(`${year}-${month}-01`).endOf('month');
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const userBatch = users.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                userBatch.map(async (user) => {
                    try {
                        return await db.$transaction(async (tx) => {
                            const [noClockInAttends, lateAttends, attends, absent, halfday, leaveAttend, shift] =
                                await Promise.all([
                                    tx.attends.findMany({
                                        where: {
                                            dates: {
                                                gte: new Date(startDate.format('YYYY-MM-DD')),
                                                lte: new Date(endDate.format('YYYY-MM-DD')),
                                            },
                                            userId: user.id,
                                            status: { in: ["No_ClockIn_ClockOut", "No_clockIn_ClockOut_Late",] },
                                        },
                                    }),
                                    tx.attends.findMany({
                                        where: {
                                            dates: {
                                                gte: new Date(startDate.format('YYYY-MM-DD')),
                                                lte: new Date(endDate.format('YYYY-MM-DD')),
                                            },
                                            userId: user.id,
                                            status: { in: ['Late', 'No_clockIn_ClockOut_Late', "Half_Day"] },
                                        },
                                    }),
                                    tx.attends.findMany({
                                        where: {
                                            dates: {
                                                gte: new Date(startDate.format('YYYY-MM-DD')),
                                                lte: new Date(endDate.format('YYYY-MM-DD')),
                                            },
                                            userId: user.id,
                                            NOT: {
                                                OR: [{ status: "Absent" }, { status: "Leave" }, { status: "Active" }, { status: "Half_Day" }],
                                            },
                                        },
                                    }),
                                    tx.attends.findMany({
                                        where: {
                                            dates: {
                                                gte: new Date(startDate.format('YYYY-MM-DD')),
                                                lte: new Date(endDate.format('YYYY-MM-DD')),
                                            },
                                            userId: user.id,

                                            status: "Absent",
                                        },
                                    }),
                                    tx.attends.findMany({
                                        where: {
                                            dates: {
                                                gte: new Date(startDate.format('YYYY-MM-DD')),
                                                lte: new Date(endDate.format('YYYY-MM-DD')),
                                            },
                                            userId: user.id,

                                            status: "Half_Day",
                                        },
                                    }),
                                    tx.attends.findMany({
                                        where: {
                                            dates: {
                                                gte: new Date(startDate.format('YYYY-MM-DD')),
                                                lte: new Date(endDate.format('YYYY-MM-DD')),
                                            },
                                            userId: user.id,

                                            status: "Leave",
                                            leaves: {
                                                type: { in: leaveType }
                                            }
                                        }
                                    }),
                                    tx.attendBranch.findFirst({
                                        where: {
                                            userId: user.id
                                        }
                                    })
                                ]);
                            let fine200 = branchAssistant.find((e) => e === shift?.branch)
                            let totalNoClockInFine = 0
                            let totalLateFine = 0
                            if (fine200) {
                                let newnoclock = noClockInAttends;
                                let newlate = lateAttends
                                totalNoClockInFine = newnoclock.reduce((sum, item) => sum + Number(item.fine2), 0)
                                totalLateFine = newlate.reduce((sum, item) => sum + Number(item.fine), 0)
                            } else {
                                const [updatedNoClockIn, updatedLate] = await Promise.all([
                                    updateAttendsInDb(noClockInAttends, 'noclockinout'),
                                    updateAttendsInDb(lateAttends, 'Late'),
                                ]);
                                totalNoClockInFine = updatedNoClockIn.reduce(
                                    (sum, _, index) => sum + (index === 0 ? 50 : 100),
                                    0,
                                );
                                totalLateFine = updatedLate.reduce(
                                    (sum, _, index) => sum + (index === 0 ? 50 : 100),
                                    0,
                                );
                            }
                            // let leave = await countMatchingLeaves(
                            //     user.id,
                            //     startDate.format('YYYY-MM-DD'),
                            //     endDate.format('YYYY-MM-DD'),
                            // );
                            console.log("leave ", user.name, leaveAttend,)
                            let totalhalf = halfday.length * 0.5;
                            let totalDay = attends.length + leaveAttend.length + totalhalf;
                            console.log("totalday ", user.name, totalDay,)
                            console.log(`total day ${attends.length} totalleave:${leaveAttend.length} totalhalf:${totalhalf}`)
                            const salary = await tx.salary.findFirst({
                                where: { userId: user.id, month: Number(month), year: Number(year) },
                            });

                            if (!salary) {
                                throw new Error(`No salary record found for user ${user.id}`);
                            }
                            let total = totalDay * salary.perDay! - totalLateFine - totalNoClockInFine + salary.advances! + salary.bonus! + salary.allowance! + salary.cover! + salary.m! + salary.overTime! + salary.transport! + salary.short!
                            const updatedSalary = await tx.salary.update({
                                where: { id: salary.id },
                                data: {
                                    total,
                                    fineNoClockIn: totalNoClockInFine,
                                    fineLate: totalLateFine,
                                    workingDay: totalDay,
                                    absent: absent.length,
                                },
                            });

                            return {
                                userId: user.id,
                                noClockInRecords: noClockInAttends.length,
                                lateRecords: lateAttends.length,
                                totalNoClockInFine,
                                totalLateFine,
                                absent: absent.length,
                                success: true,
                            };
                        });
                    } catch (err) {
                        const error = err as Error;
                        console.error(`Error processing user ${user.id}:`, error);
                        return {
                            userId: user.id,
                            error: error.message || "Unknown error occurred",
                            success: false,
                        };
                    }
                }),
            );

            results.push(...batchResults);

            if (i + BATCH_SIZE < users.length) {
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
        return { success: "success" }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}
const updateAttendsInDb = async (attendArray: any[], status: "Late" | "noclockinout") => {
    return await db.$transaction(
        attendArray.map((attend, index) => {
            let data;
            if (status == "Late") {
                data = {
                    fine: index === 0 ? 50 : 100
                }
            } else {
                data = {
                    fine2: index === 0 ? 50 : 100
                }
            }
            return db.attends.update({
                where: { id: attend.id },
                data
            });
        }),
    );
};
const countMatchingLeaves = async (
    userId: string,
    startDate: string,
    endDate: string,
) => {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let leaves = await db.leave.findMany({
            where: {
                userId,
                createdAt: {
                    gte: start,
                    lte: end,
                },
                status: "Approve",
                type: {
                    in: leaveType, // Assuming leaveType is an array
                },
            },
        });

        return leaves.length;
    } catch (error) {
        console.log("🚀 ~ countMatchingLeaves ~ error:", error);
        return null;
    }
};