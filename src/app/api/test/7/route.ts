import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend Day.js with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);



export const POST = async () => {
    try {
        // Set your local timezone (e.g., 'Asia/Bangkok')
        const LOCAL_TIMEZONE = 'Asia/Kuala_Lumpur';

        // Fetch attendance records for June 2025
        const users = await db.user.findMany({
            where: {
                isDelete: false,
                AttendBranch: { team: "E" }
            },

        });

        const BATCH_SIZE = 5;
        const results = [];

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                batch.map(async (a) => {
                    try {
                        const attend = await db.attends.findMany({
                            where: {
                                userId: a.id,
                                dates: { gte: new Date("2025-06-01"), lte: new Date("2025-06-30") }
                            }
                        })
                        let nightshift = 0;
                        let listnightShift: any = [];
                        attend.map((a) => {
                            const clockInUTC = dayjs(a.clockIn)
                            const clockOutUTC = dayjs(a.clockOut);
                            const clockInLocal = clockInUTC.tz(LOCAL_TIMEZONE);
                            const timeclockIn = clockInUTC.format("HH:mm").split(':').map(Number);
                            const clockOutLocal = clockOutUTC.tz(LOCAL_TIMEZONE);
                            const timeclockOut = clockOutUTC.format("HH:mm").split(':').map(Number);
                            if (a.status == "Full_Attend" || a.status == "Late") {
                                if (timeclockOut[0] >= 0 && timeclockOut[0] < 11) {
                                    nightshift++;
                                    listnightShift.push({ idAttend: a.id, dates: a.dates, status: a.status })
                                }
                            } else if (a.status == "No_ClockIn_ClockOut" || a.status == "No_clockIn_ClockOut_Late") {
                                if (a.clockOut) {
                                    if (timeclockOut[0] >= 0 && timeclockOut[0] < 11) {
                                        nightshift++;
                                        listnightShift.push({ idAttend: a.id, dates: a.dates, status: a.status })
                                    }
                                } else {
                                    if (a.clockIn) {
                                        if (timeclockIn[0] >= 18) {
                                            nightshift++
                                            listnightShift.push({ idAttend: a.id, dates: a.dates, status: a.status })
                                        }
                                    }
                                }
                            } else if (a.status == "Half_Day") {
                                if (timeclockIn[0] >= 18) {
                                    nightshift++
                                    listnightShift.push({ idAttend: a.id, dates: a.dates, status: a.status })
                                }
                            }
                        })
                        let salary = await db.salary.findFirst({ where: { userId: a.id, month: 6, year: 2025 } })
                        if (!salary) {
                            throw new Error("No salary");
                        }
                        let overTime = nightshift * 10
                        await db.salary.update({ where: { id: salary.id }, data: { overTime } })
                        // Convert to local time using Day.js

                        return {
                            userId: a.id,
                            name: a.username,
                            overTime,
                            nightshift,
                            listnightShift,
                            success: true

                        };
                    } catch (err) {
                        const error = err as Error;
                        console.error(`Error processing user ${a.id}:`, error);
                        return {
                            userId: a.id,
                            error: error.message || "Unknown error occurred",
                            success: false,
                        };
                    }
                })
            );

            results.push(...batchResults);

            if (i + BATCH_SIZE < users.length) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        // Filter only successful results with night shifts
        const nightShiftWorkers = results
            .filter(r => r.status === "fulfilled" && r.value.success)
            .map(r => (r as PromiseFulfilledResult<any>).value);

        const summary = {
            totalRecordsProcessed: users.length,
            totalNightShifts: nightShiftWorkers.length,
            nightShiftWorkers: nightShiftWorkers,
            timezoneUsed: LOCAL_TIMEZONE,
            timeRangeConsidered: "00:00 - 07:00 local time",
            totalFailed: results.filter((r) => r.status === "rejected" || !r.value.success)
                .length,
            totalSuccessful: results.filter(
                (r) => r.status === "fulfilled" && r.value.success,
            ),

        };

        return Response.json(summary, { status: 200 });
    } catch (error) {
        console.error("Error in night shift analysis:", error);
        return Response.json(
            { error: "Internal server error", details: error },
            { status: 500 }
        );
    }
}