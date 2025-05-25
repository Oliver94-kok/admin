'use server'

import { db } from "@/lib/db"
import { Attends } from "@prisma/client"


export const editAttend = async (attend: Attends) => {
    try {
        const result = await db.attends.update({
            where: {
                id: attend.id
            },
            data: {
                status: attend.status,
                clockIn: attend.clockIn,
                clockOut: attend.clockOut,
                dates: attend.dates
            }
        })
        return { success: "Attend updated successfully", result }
    } catch (error) {
        return { error: "Internal server error" }
    }
}