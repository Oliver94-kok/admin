'use server'

import { db } from "@/lib/db";

export const editName = async (id: string, name: string) => {
  try {
    const user=await db.user.findFirst({
      where: {id: id},
    })
    if (!user) {
      return {error: "User not found"};
    }
    await db.user.update({
      where: { id: id },
        data: { name: name },
    });
    return {success: true};
  } catch (error) {
    console.error("Error editing name:", error);
    return {error: "Failed to edit name"};
  }
}