import { db } from "@/lib/db"




export const Logging = async (userId: string, action: string, details?: string) => {
    try {
        await db.log.create({
            data: {
                action,
                details,
                userId
            }
        })
    } catch (error) {
        return null
    }
}