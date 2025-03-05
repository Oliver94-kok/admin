import { db } from "@/lib/db"


export const GET = async()=>{
    try {
        let result =await db.locatioUsers.findMany()
        return Response.json(result,{status:200})
    } catch (error) {
        return Response.json(error,{status:400})
    }
}


export const POST = async (req: Request) => {
    try {
        const {userId,address,branch,type} = await req.json()
        // let user= await db.user.findFirst({where:{id:userId}});
        // if(!user ) throw new Error("User not found");
        // if(user.role == "USER") throw new Error("Error user role");
        let data ={
            userId,
            address,
            branch,
            type
        }
        await db.locatioUsers.create({data})
        return Response.json({status:"Success"},{status:200})
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return Response.json(error,{status:400})
    }
}