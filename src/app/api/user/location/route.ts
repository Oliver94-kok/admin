import { db } from "@/lib/db"

export const POST = async (req: Request) => {
    try {
        const {userId,address,branch,type} = await req.json()
        let user= await db.user.findFirst({where:{id:userId}});
        if(!user ) throw new Error("User not found");
        // if(user.role == "USER") throw new Error("Error user role");
        let data ={
            userId,
            location:address,
            branch,
            type
        }
        await db.managerLocation.create({data})
        return Response.json({status:"Success"},{status:200})
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return Response.json(error,{status:400})
    }
}