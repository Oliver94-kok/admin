"use client"
import { SalaryCal } from "@/action/dev/calSalary"
import { useState } from "react"
import { Loader2 } from "../common/loader2/loader2"



export const CalculateSalary = () => {
    const [month, setMonth] = useState("")
    const [year, setYear] = useState("")
    const [team, setTeam] = useState("")
    const [isLoading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const CalSalary = async () => {
        try {
            setLoading(true)
            if (year == null || year == "") {
                setError("Please select Month")
                return
            }
            setError("")
            if (month == null || month == "") {
                setError("Please select Month")
                return
            }
            setError("")
            if (team == null || team == "") {
                setError("Please select Month")
                return
            }
            setError("")
            SalaryCal({ team, year, month }).then((data) => {
                if (data.error) {
                    setError(data.error)
                    return
                }
                if (data.success) {
                    setSuccess(data.success)
                    return
                }
            }).finally(() => setLoading(false))

        } catch (error) {
            console.log("🚀 ~ CalSalary ~ error:", error)

        }
    }
    return (
        <>
            {isLoading ? <Loader2 /> : (
                <div className="flex flex-col space-y-2">
                    Calculate Salary
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
                        <label htmlFor="">Team</label>
                        <select
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                        >
                            <option value="">Select team</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                            <option value="SW">SW</option>
                            <option value="Ocean">Ocean</option>
                        </select>
                    </div>
                    {error && (<><p className="text-red-600">{error}</p></>)}
                    {success && (<><p className="text-green-600">{success}</p></>)}
                    <button
                        onClick={CalSalary}
                        className=" bg-blue-700 rounded-md w-full text-white">Calculate</button>
                </div>
            )}

        </>
    )
}