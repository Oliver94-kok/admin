'use server'

import { db } from "@/lib/db"
import dayjs from "dayjs"


export const deleteLeave = async (id: string) => {
    try {
        const leave = await db.leave.findFirst({ where: { id }, include: { Attends: true } })
        if (!leave) {
            return { error: "leave not exist" }
        }
        const startDate = dayjs(leave.startDate);
        console.log("🚀 ~ deleteLeave ~ startDate:", startDate)
        const today = dayjs().startOf('day'); // Normalize to 00:00:00 to compare dates only

        // Determine if the leave has already started (or starts today)
        const isStarted = startDate.isSameOrBefore(today, 'day');
        // startDate.isSameOrBefore(today, 'day')
        if (isStarted) {
            for (const a of leave.Attends) {
                if (a.clockIn && a.clockOut) {
                    await db.attends.update({
                        where: { id: a.id },
                        data: {
                            status: a.fine ? "Late" : "Full_Attend",
                        },
                    });
                } else {
                    await db.attends.update({
                        where: { id: a.id },
                        data: {
                            status: "No_ClockIn_ClockOut",
                        },
                    });
                }
            }
        } else {
            for (const a of leave.Attends) {
                // Leave is in the future — safe to delete attend records
                await db.attends.delete({
                    where: { id: a.id },
                });
            }
        }

        await db.leave.update({ where: { id: leave.id }, data: { isDelete: true } })
        return { success: true }
    } catch (error) {
        console.log("🚀 ~ deleteLeave ~ error:", error)
        return { error: "Have server error" }
    }
}