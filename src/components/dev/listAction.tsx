import { CalculateSalary } from "./calculateSalary"
import { CheckAttend } from "./checkAttend"
import { ClockAttend } from "./clockAttend"
import { ShiftClock } from "./clockShift"
import { NoClockInorOut } from "./noClockInorOut"




export const ListAction = () => {
    return (
        <>
            <div className="grid grid-cols-3 space-y-2">
                <div
                    className=" h-[22rem] w-[21rem] rounded-[10px] bg-white p-4 px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 2xl:p-10">
                    <ClockAttend />
                </div>
                <div
                    className=" h-[22rem] w-[21rem] rounded-[10px] bg-white p-4 px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 2xl:p-10">
                    <CalculateSalary />
                </div>
                <div
                    className=" h-[22rem] w-[21rem] rounded-[10px] bg-white p-4 px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 2xl:p-10">
                    <ShiftClock />
                </div>
                <div
                    className=" h-[22rem] w-[21rem] rounded-[10px] bg-white p-4 px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 2xl:p-10">
                    <CheckAttend />
                </div>
                <div
                    className=" h-[22rem] w-[21rem] rounded-[10px] bg-white p-4 px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 2xl:p-10">
                    <NoClockInorOut />
                </div>
            </div>
        </>
    )
}