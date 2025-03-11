'use client'

import { AddClock } from "@/action/dev/addClock"
import { useState } from "react"
import { Loader2 } from "../common/loader2/loader2"

export const ClockAttend = () => {
    const [username, setUsername] = useState<string>("")
    const [date, setDate] = useState<string>("")
    const [clockIn, setClockIn] = useState(false);
    const [clockOut, setClockOut] = useState(false)
    const [error, setError] = useState<string>("")
    const [success, setSuccess] = useState<string>("")
    const [isloading, setLoading] = useState<boolean>(false)
    const submit = async () => {
        try {

            if (username == null || username == "") {
                setError("Please insert username");
                return
            }
            setError("")
            if (date == null || date == "") {
                setError("Please insert date");
                return
            }
            setError("")
            if (!clockIn && !clockOut) {
                setError("Please choose clock in or out");
                return;
            }
            setError("");
            setLoading(true)
            AddClock({ username, clockIn, clockOut, date }).then((data) => {
                if (data.error) {
                    setSuccess("")
                    setError(data.error)
                    return
                }
                if (data.Succes) {
                    setError("")
                    setSuccess(data.Succes)
                    return
                }
            }).finally(() => setLoading(false))
        } catch (error) {
            console.log("🚀 ~ submit ~ error:", error)

        }
    }
    return (
        <>
            <p>Add clock attend</p>
            {isloading ? <Loader2 /> : (
                <div className="flex space-y-2 flex-col">
                    <label htmlFor="">Username</label>
                    <input
                        type="text"
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary" />
                    <label htmlFor="">Date</label>
                    <input
                        type="text"
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                        placeholder="YYYY-MM-DD"
                    />
                    <div className=" flex flex-row gap-2">
                        <input type="checkbox" id="clockIn" onChange={(e) => setClockIn(e.target.checked)} />
                        <label htmlFor="clockIn">Clock In</label>
                    </div>
                    <div className=" flex flex-row gap-2">
                        <input type="checkbox" id="clockOut" onChange={(e) => setClockOut(e.target.checked)} />
                        <label htmlFor="clockOut">Clock Out</label>
                    </div>
                    {error && (<><p className="text-red-600">{error}</p></>)}
                    {success && (<><p className="text-green-600">{success}</p></>)}
                    <button onClick={submit} className=" bg-blue-700 rounded-lg w-full text-white">Add</button>
                </div>
            )}
        </>
    )
}