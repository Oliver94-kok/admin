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
            addressIn:address,
            branch,
            timeIn:new Date(),
            type
        }
        await db.locatioUsers.create({data})
        return Response.json({status:"Success"},{status:200})
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return Response.json(error,{status:400})
    }
}

export const PATCH = async (req: Request) => {
    try {
        const {userId,address,branch,type} = await req.json()
        // let user= await db.user.findFirst({where:{id:userId}});
        // if(!user ) throw new Error("User not found");
        // if(user.role == "USER") throw new Error("Error user role");
        let location = await db.locatioUsers.findFirst({
            where:{userId,status:"Active"}
        })
        await db.locatioUsers.update({where:{id:location?.id},data:{timeOut:new Date(),addressOut:address,status:"COMPLETE"}})
        return Response.json({status:"Success"},{status:200})
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return Response.json(error,{status:400})
    }
}