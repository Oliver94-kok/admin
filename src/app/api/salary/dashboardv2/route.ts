import { db } from "@/lib/db";
import { roleAdmin } from "@/lib/function";
import { SalaryUser } from "@/types/salary";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const m = searchParams.get("month");
        const y = searchParams.get("year");
        const role = searchParams.get("role");
        let month = parseInt(m!);
        let year = parseInt(y!);
        let data;
        if (role == "ADMIN") {
            data = await db.salary.findMany({
                where: { month, year, users: { isDelete: false, role: "USER" } },
                include: {
                    users: { select: { name: true, username: true, userImg: true, AttendBranch: { select: { team: true, branch: true } } } },
                },
                orderBy: [
                    { users: { AttendBranch: { team: 'asc' } } },
                    { users: { username: "asc" } },
                ],
            });
        } else {
            let team = await roleAdmin(role!);
            data = await db.salary.findMany({
                where: { month, year, users: { isDelete: false, role: "USER", AttendBranch: { team } } },
                include: {
                    users: { select: { name: true, username: true, userImg: true, AttendBranch: { select: { team: true, branch: true } } } },
                },
                orderBy: [
                    { users: { AttendBranch: { team: 'asc' } } },
                    { users: { username: "asc" } },
                ],
            });
        }
        return Response.json(data, { status: 200 });
    } catch (error) {
        return Response.json({ error }, { status: 400 })
    }
};
