"use server"

import { CheckSalarys } from "@/data/salary"
import { db } from "@/lib/db"
import { TimeUtils } from "@/lib/timeUtility"
import { AttendStatus } from "@prisma/client"

interface addClockProp {
    username: string
    clockIn: boolean
    clockOut: boolean
    date: string
}

export const AddClock = async ({ username, clockIn, clockOut, date }: addClockProp) => {
    try {
        const user = await db.user.findFirst({ where: { username } })
        if (!user) throw new Error("User not found");
        const shift = await db.attendBranch.findFirst({ where: { userId: user.id } })
        if (!shift) throw new Error("No shift time")
        let nDate = new Date(date)
        if (clockIn && clockOut) {
            let attend = await db.attends.findFirst({ where: { dates: nDate, userId: user.id } })
            if (attend) throw new Error("User has attend")
            const shiftIn = TimeUtils.createDateFromTimeString(
                nDate,
                shift.clockIn!,
                "in",
            );
            const shiftOut = TimeUtils.createDateFromTimeString(
                nDate,
                shift.clockOut!,
                "out",
            );
            let data = {
                userId: user.id,
                dates: nDate,
                clockIn: shiftIn,
                clockOut: shiftOut,
                status: AttendStatus.Full_Attend
            }
            await db.attends.create({ data })
            await CheckSalarys({
                userId: user.id,
                fineLate: null,
                fineNoClockIn: null,
                fineNoClockOut: null,
                overtimes: null,
                workingHour: null,
                add10: null
            });
            return { Succes: "Success" }
        }
        if (clockIn) {
            console.log("masuk clock in")
            let attend = await db.attends.findFirst({ where: { dates: nDate, userId: user.id } })
            if (attend) throw new Error("User has attend")
            const shiftIn = TimeUtils.createDateFromTimeString(
                nDate,
                shift.clockIn!,
                "in",
            );
            let data = {
                userId: user.id,
                dates: nDate,
                clockIn: shiftIn,
                status: AttendStatus.Active
            }
            await db.attends.create({ data })
            return { Succes: "Success" }
        }
        if (clockOut) {
            let attend = await db.attends.findFirst({ where: { dates: nDate, userId: user.id } })
            const shiftOut = TimeUtils.createDateFromTimeString(
                nDate,
                shift.clockOut!,
                "out",
            );
            await db.attends.update({ where: { id: attend?.id }, data: { clockOut: shiftOut, status: AttendStatus.Full_Attend } })
            return { Succes: "Success" }
        }

        return { Succes: "Success" }
    } catch (error) {
        console.log("🚀 ~ AddClock ~ error:", error)
        return { error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}