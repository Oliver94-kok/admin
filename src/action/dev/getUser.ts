'use server'

import { db } from "@/lib/db"
import { Attends, Leave, User } from "@prisma/client"

interface datagetUsers {
    user: User,
    attend: Attends[],
    leave: Leave[]
}

export const getUsers = async (user: string, type: "name" | "username", month: number, year: number) => {

    try {
        if (!user) {
            return { Error: "Please enter a user" }
        }
        if (!type) {
            return { Error: "Please enter a type" }
        }
        let wherecondition = {};
        if (type === "name") {
            wherecondition = {
                name: {
                    contains: user,

                }
            }
        } else {
            wherecondition = {
                username: user
            }
        }

        const users = await db.user.findFirst({
            where: wherecondition,
            select: {
                id: true,
                name: true,
                username: true,
            }
        })
        if (!users) {
            return { Error: "User not found" }
        }
        const attend = await db.attends.findMany({
            where: {
                userId: users.id,
                dates: {
                    lte: new Date(`${year}-${month}-31`),
                    gte: new Date(`${year}-${month}-01`)
                }


            }
        })
        console.log("🚀 ~ getUsers ~ attend:", attend)
        const leave = await db.leave.findMany({ where: { userId: users.id } })

        return { Success: "Success", data: { user: users, attend, leave } as datagetUsers }
    } catch (error) {
        console.log("🚀 ~ getUsers ~ error:", error)
        return { Error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}