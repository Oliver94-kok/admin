import { db } from "@/lib/db";
import { roleAdmin } from "@/lib/function";
import { SalaryUser } from "@/types/salary";
import dayjs from "dayjs";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const m = searchParams.get("month");
        const y = searchParams.get("year");
        const role = searchParams.get("role");

        const month = parseInt(m!);
        const year = parseInt(y!);

        if (!m || !y || isNaN(month) || isNaN(year)) {
            return Response.json({ error: "Valid month and year required" }, { status: 400 });
        }

        const startOfMonth = dayjs().year(year).month(month - 1).startOf('month').toDate();
        const endOfMonth = dayjs().year(year).month(month - 1).endOf('month').toDate();
        // Base user condition: must be role USER
        const userWhere: any = {
            role: "USER",
            OR: [
                { isDelete: false },
                {
                    isDelete: true,
                    Attends: {
                        some: {
                            dates: { gte: startOfMonth, lte: endOfMonth } // ← change to 'date' if needed
                        }
                    }
                }
            ]
        };

        // Add team filter for non-admins
        if (role !== "ADMIN") {
            const team = await roleAdmin(role!);
            userWhere.AttendBranch = { team };
        }

        const data = await db.salary.findMany({
            where: {
                month,
                year,
                users: userWhere
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        userImg: true,
                        isDelete: true,
                        AttendBranch: {
                            select: {
                                team: true,
                                branch: true
                            }
                        }
                    }
                },
            },
            orderBy: [
                { users: { AttendBranch: { team: 'asc' } } },
                { users: { username: "asc" } },
            ],
        });

        return Response.json(data, { status: 200 });
    } catch (error) {
        console.error("Salary fetch error:", error);
        return Response.json({ error: "Failed to load data" }, { status: 500 });
    }
};