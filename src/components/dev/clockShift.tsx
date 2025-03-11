'use client'

import { getShiftIn } from "@/data/attend"
import { useEffect, useState } from "react"
import { Loader2 } from "../common/loader2/loader2";
import { addClockByShift } from "@/action/dev/addShiftClock";
type AttendBranchGroupByOutputType = {
    clockIn: string | null;
    // other properties...
};
export const ShiftClock = () => {
    const [shiftTime, setShiftTime] = useState<AttendBranchGroupByOutputType[] | undefined>(undefined);
    const [isLoading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [shift, setShift] = useState("");
    const [date, setDate] = useState("")
    useEffect(() => {
        tsry()

    }, [])
    const tsry = async () => {
        try {
            let data = await getShiftIn()
            if (data) {
                setShiftTime(data)
            }
            console.log("🚀 ~ useEffect ~ data:", data)
        } catch (error) {

        }
    }
    const addShfit = async () => {
        try {
            if (shift == null || shift == "") {
                setError("Please select shift")
                return;

            }
            setError("")
            setLoading(true)
            addClockByShift({ shift, date }).then((data) => {
                if (data.success == false) {
                    setSuccess("")
                    setError(data.error!)
                    return
                }
                if (data.success) {
                    setSuccess("Success")
                    return
                }
            }).finally(() => setLoading(false))
        } catch (error) {
            console.log("🚀 ~ addShfit ~ error:", error)

        }
    }
    return (
        <>
            <div>
                Add Attend by shift
                {isLoading ? <Loader2 /> : (
                    <div className="flex space-y-2 flex-col">
                        <div>
                            <label htmlFor="">Date</label>
                            <input
                                type="text"
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                                placeholder="YYYY-MM-DD"
                            />
                        </div>
                        <div>
                            <label htmlFor="">Shift Time</label>
                            <select
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                                className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                            >
                                <option value="">Select Shift time</option>
                                {shiftTime?.map((shift) => (
                                    <>
                                        <option value={shift.clockIn!}>{shift.clockIn}</option>
                                    </>
                                ))}
                            </select>
                        </div>
                        {error && (<><p className="text-red-600">{error}</p></>)}
                        {success && (<><p className="text-green-600">{success}</p></>)}
                        <button className=" h-[2rem] bg-blue-700 rounded-lg w-full text-white">Add by shift</button>
                    </div>
                )}
            </div>
        </>
    )
}