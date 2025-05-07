import { db } from "@/lib/db";


export const POST = async (req: Request) => {
    try {
        const { userId } = await req.json();
        const users = await db.user.findFirst({ where: { id: userId, role: "USER", isDelete: false }, select: { AttendBranch: { select: { team: true, clockIn: true, clockOut: true } } } })
        if (!users) return Response.json({ error: "User not found" }, { status: 400 })
        const branchs = await db.branch.findMany({
            where: { team: users.AttendBranch?.team }, select: {
                id: true, code: true, address: true, longtitude: true, latitude: true, team: true
            }
        })
        let result = {
            clockIn: users.AttendBranch?.clockIn,
            clockOut: users.AttendBranch?.clockOut,
            branchs
        }
        return Response.json(result, { status: 200 })
    } catch (error) {
        return Response.json({ error }, { status: 500 })
    }
}