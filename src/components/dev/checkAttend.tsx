'use client'
import { attendCheck } from "@/action/dev/checkAttend"
import { useState } from "react"


export const CheckAttend = () => {
    const [date, setDate] = useState("")
    const check = async () => {
        try {
            attendCheck({ date: "2025-03-10" }).then((data) => {
                console.log("🚀 ~ attendCheck ~ data:", data)

            })
        } catch (error) {
            console.log("🚀 ~ check ~ error:", error)

        }
    }
    return (
        <>
            <div className="flex flex-col space-y-4">
                Check duplicate attend by date
                <div>
                    <label htmlFor="">Date</label>
                    <input
                        type="text"
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                        placeholder="YYYY-MM-DD"
                    />

                </div>
                <button onClick={check} className=" bg-blue-700 rounded-lg w-full text-white">Check</button>
            </div>
        </>
    )
}