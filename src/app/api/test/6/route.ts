import { db } from "@/lib/db"
import { AttendStatus } from "@prisma/client"
import dayjs from "dayjs"


export const POST = async (req: Request) => {
  try {
    let data = {
      userId: "cm4w85rac0004704jllpj20h6",
      dates: new Date("2025-03-22"),
      status: AttendStatus.Active
    }
    await db.attends.create({ data })
    return Response.json({ "status": "okay" }, { status: 200 })
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}