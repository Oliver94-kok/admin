import { db } from "@/lib/db";
import { checkClockLate } from "./attend";
import { Prisma } from "@prisma/client";

export const AddSalary = async (userid: string) => {
  const user = await checkClockLate(userid);

  let salary = await db.salary.findFirst({
    where: { userId: userid, month: user.month, year: user.year },
  });
  let lateFine;

  if (salary) {
    if (salary.late) {
      if (salary.late >= 1) {
        lateFine = 100;
      } else {
        lateFine = 50;
      }
    }
    // let salarys = salary.salary as Prisma.JsonArray;
    let ns;
    if (user.late == 1) {
      ns = {
        day: user.day,
        late: {
          fine: lateFine,
        },
      };
    } else {
      ns = {
        day: user.day,
        late: null,
      };
    }
    // salarys.push(ns);
    let total = 0;
    // salarys.map((e) => {
    //   total = total + e["total"];
    // });
    // console.log(total)
    // // let data = {
    //   salary: s,
    //   late: Number(salary.late) + 1,
    //   total,
    // };
    // let update = await db.salary.update({ where: { id: salary.id }, data: {} });
  } else {
    let newJson;
    if (user.late == 1) {
      newJson = {
        day: user.day,
      };
    }
  }
};

export const createSalary=async(userId:string,late:number)=>{
  let data={
    userId,
    year:new Date().getFullYear(),
    month:new Date().getMonth()+1,
    workingDay: 1,
    late
  }
  try {
    await db.salary.create({data});
    return {success:"successs"}
  } catch (error) {
    return null;
  }
}
const updateSalary=async(id:string,fine:number,overTimeHour:number,day:number)=>{
  try {
    await db.salary.update({where:{id},data:{workingDay:day,overTimeHour,late:fine}})
    return {success:"success update"}
  } catch (error) {
    return {error:"error"}
  }
  

}


export const checkSalary=async(userId:string,fine:number,overTimeHour:number)=>{
  let month = new Date().getMonth()+1;
  let year = new Date().getFullYear();
  let salary = await db.salary.findFirst({where:{userId,month,year}})
 
  if(salary) {
    let late = 0;
    if(fine){
       late = salary.late! + fine;
    }
    let day = salary.workingDay + 1;
    let ot = salary.overTimeHour! + overTimeHour;
    let salaryUpdate = await updateSalary(salary.id,late,ot,day)
    return salaryUpdate;
  }
  let result = await createSalary(userId,fine);
  return result;
}
export const checkNotClockInSalary=(userId:string,fine:number,overTimeHour:number)=>{}
