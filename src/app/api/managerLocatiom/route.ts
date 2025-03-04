import { db } from "@/lib/db"


export const GET =async()=>{
    try {
        let result = await db.managerLocation.findMany()
        return Response.json(result,{status:200})
    } catch (error) {
        return Response.json(error,{status:400})
    }
}

export const POST = async(req:Request)=>{
    try {
        const {userId,address,branch,type}= await req.json();
        let data = {
            userId  ,
            location :address,
            branch   ,
            type
        }
        console.log("🚀 ~ POST ~ userId:", userId)
        let result = await db.managerLocation.create({data})
        return Response.json(result,{status:200})
    } catch (error) {
        return Response.json(error,{status:400})
    }
}