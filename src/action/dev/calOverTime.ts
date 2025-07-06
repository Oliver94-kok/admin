'use server'

import { calculateOvertimeHours } from "@/data/attend"
import { db } from "@/lib/db"
import { TimeUtils } from "@/lib/timeUtility"
import dayjs from "dayjs"



export const CalculateOverTime = async (type: "nightshift" | "Office", startDate: Date, endDate: Date) => {
    try {
        if (type == "Office") {
            await officeOvertime(startDate, endDate)
        }
    } catch (error) {
        console.log("🚀 ~ CalculateOverTime ~ error:", error)
        return { Error: error }
    }
}


const officeOvertime = async (startDate: Date, endDate: Date) => {
    const users = await db.user.findMany({
        where: {
            role: "USER", isDelete: false, AttendBranch: {
                branch: "小off"
            }
        }
    });
    const result = await Promise.allSettled(
        users.map(async (user) => {
            const attends = await db.attends.findMany({
                where: { userId: user.id, dates: { gte: new Date(startDate), lte: new Date(endDate) } }
            })
            let overtime = 0;
            attends.map(async (attend) => {


                // if (attend.overtime) {
                // overtime += attend.overtime!
                // } else {
                let ot = calculate_overtime2(attend.clockIn, attend.clockOut);
                overtime += ot!
                await db.attends.update({ where: { id: attend.id }, data: { overtime: ot } });
                // }

            })
            const salary = await db.salary.findFirst({ where: { userId: user.id, month: startDate.getMonth() + 1, year: startDate.getFullYear() } })
            await db.salary.update({
                where: {
                    id: salary?.id
                },
                data: {
                    overTimeHour: overtime,
                    overTime: overtime * 10
                }
            })
        })
    )
}

const calculate_overtime2 = (clockin: Date | null, clockOut: Date | null) => {
    if (!clockOut) return 0; // No clock-out → no overtime

    const shiftOut = dayjs(clockOut);
    let effectiveClockIn = clockin ? dayjs(clockin) : shiftOut.subtract(6, 'hour');

    const workedHours = shiftOut.diff(effectiveClockIn, 'hour', true);
    const overtimeHours = workedHours - 6;

    // If overtime < 1 hour → return 0, else round down
    return overtimeHours >= 1 ? Math.floor(overtimeHours) : 0;
};