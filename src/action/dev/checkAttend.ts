'use server'

import { db } from "@/lib/db"

interface attendCheckProps {
    date: string
}

export const attendCheck = async ({ date }: attendCheckProps) => {
    try {
        const multipleAttendanceUsers = await db.attends.groupBy({
            by: ['userId'],
            where: {
                dates: new Date(date),
            },
            _count: {
                _all: true,
            },

        });
        const result = await db.attends.groupBy({
            by: ['userId'],
            where: {
                dates: new Date('2025-03-10'),
            },
            _count: {
                userId: true,
            },
            having: {
                userId: {
                    _count: {
                        gt: 1,
                    },
                },
            },
        });
        console.log("🚀 ~ attendCheck ~ multipleAttendanceUsers:", result)
        return { success: true, result }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}