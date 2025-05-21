'use client'
import { useEffect, useState } from "react"
import { Loader2 } from "../common/loader2/loader2";
import { noClockInOutLate } from "@/action/dev/noclockInout";

export const NoClockInorOut = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [shift, setShift] = useState("");
    const [date, setDate] = useState("");
    const NoClockInOut = async () => {
        try {
            setLoading(true)
            let result = await noClockInOutLate();
            console.log("🚀 ~ NoClockInOut ~ result:", result)
            if (result.error) {
                setError(result.error)
                return;
            }
            if (result.success) {
                setSuccess(result.success)
                return
            }
        } catch (error) {
            console.log("🚀 ~ NoClockInOut ~ error:", error)

        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <div>
                Check No clock in or out to absent
                {isLoading ? <Loader2 /> : (
                    <div className="flex space-y-2 flex-col">


                        {error && (<><p className="text-red-600">{error}</p></>)}
                        {success && (<><p className="text-green-600">{success}</p></>)}
                        <button className=" h-[2rem] bg-blue-700 rounded-lg w-full text-white"
                            onClick={NoClockInOut}
                        >Check</button>
                    </div>
                )}
            </div>
        </>
    )
}