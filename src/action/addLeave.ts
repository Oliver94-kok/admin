'use server'

import { addLeaveAttend, forEachDate } from "@/data/leave";
import { db } from "@/lib/db"
import { leaveTypeMap } from "@/types/leave";
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
export interface AddUserLeave {
    userId: string,
    startDate: Date,
    endDate: Date,
    duration: number,
    reason: string,
    leaveType: string
}
function calculateHoursBetween(startTime: string, endTime: string): number {
    const start = dayjs(`2023-01-01T${startTime}`);
    const end = dayjs(`2023-01-01T${endTime}`);

    const diffMs = end.diff(start);
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}
export const AddLeaveUser = async ({ userId, startDate, endDate, duration, reason, leaveType }: AddUserLeave) => {
    try {
        const user = await db.user.findFirst({ where: { id: userId } })
        if (!user) return { error: "User not found" }
        let startLeave = dayjs(startDate);
        let endLeave = dayjs(endDate)
        const englishType = leaveTypeMap[leaveType] || "Unknown leave type";
        await db.leave.create({ data: { userId, startDate: startLeave.format("YYYY-MM-DD HH:mm"), endDate: endLeave.format("YYYY-MM-DD HH:mm"), duration, reason, type: englishType, status: "Pending" } })
        return { Success: "Success add leave" }
    } catch (error) {
        return { error: "something wrong" }
    }
}