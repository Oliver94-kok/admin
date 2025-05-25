'use server'

import { db } from "@/lib/db"
import { AttendBranch, Attends, Leave, Salary, User } from "@prisma/client"

interface datagetUsers {
    user: User,
    attend: Attends[],
    leave: Leave[],
    branch: AttendBranch,
    salary: Salary
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
                Attends: {
                    where: {
                        dates: {
                            lte: new Date(`${year}-${month}-31`),
                            gte: new Date(`${year}-${month}-01`)
                        }
                    }
                },
                Leave: true,
                AttendBranch: true,
            }
        })
        const salary = await db.salary.findFirst({ where: { month: month, year: year, userId: users?.id } })
        if (!users) {
            return { Error: "User not found" }
        }
        const { id, name, username, Attends, AttendBranch, Leave, } = users;
        return { Success: "Success", data: { user: { id, name, username }, attend: Attends, leave: Leave, branch: AttendBranch, salary } as datagetUsers }

    } catch (error) {
        console.log("🚀 ~ getUsers ~ error:", error)
        return { Error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
}