'use client'
import { CalculateOverTime } from "@/action/dev/calOverTime"
import { attendCheck } from "@/action/dev/checkAttend"
import { useState } from "react"
import { Loader2 } from "../common/loader2/loader2"
import { calFineUser } from "@/action/dev/calFine"

export const Fine = () => {
    const [type, setType] = useState("")
    const [month, setMonth] = useState("")
    const [year, setYear] = useState("")
    const [error, setError] = useState("");
    const [isloading, setIsLoading] = useState<boolean>(false)
    const [succces, setSucces] = useState("")
    const check = async () => {
        try {
            setIsLoading(true)
            if (!year || !month) {
                alert("Please select both year and month");
                return;
            }

            // Convert to numbers
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);

            // First day is always the 1st of the month
            const firstDay = new Date(yearNum, monthNum - 1, 1);

            // Last day: go to next month and back one day
            const lastDay = new Date(yearNum, monthNum, 0);

            // Format dates as YYYY-MM-DD
            const formatDate = (date: Date) => {
                const pad = (num: number) => num.toString().padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
            };

            const firstDayFormatted = formatDate(firstDay);
            const lastDayFormatted = formatDate(lastDay);


            let result = await calFineUser(firstDay, lastDay)
            if (result.error) {
                setError(result.error)
                return
            }
            if (result.success) {
                setSucces(result.success)
                return
            }

        } catch (error) {
            console.log("🚀 ~ check ~ error:", error);
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <>
            <div className="flex flex-col space-y-4">
                calculate Fine
                {isloading ? <Loader2 /> : <>
                    <div>
                        <label htmlFor="">Year</label>
                        <select
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="">Select year</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="">Month</label>
                        <select
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            <option value="">Select month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('en-US', { month: "long" })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        >
                            <option value="">Select</option>
                            <option value='nightshift'>Night shift</option>
                            <option value='Office'>Office</option>
                        </select>
                    </div>
                    <button onClick={check} className=" bg-blue-700 rounded-lg w-full text-white">Check</button>
                    {succces && <>{succces}</>}
                    {error && <>{error}</>}

                </>}
            </div>
        </>
    )
}