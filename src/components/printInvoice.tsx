import { SalaryRecord } from "@/types/salary2";

export const PayslipContent: React.FC<{ data: SalaryRecord }> = ({ data }) => {
    const { salary, result } = data;

    const calculateDeduction = () => {
        return ((result.dataAbsent.length * 2) * (salary.perDay || 0)) +
            (salary.fineLate || 0) +
            (salary.fineNoClockIn || 0) +
            (salary.fineNoClockOut || 0);
    };

    const calculateTotal = () => {
        return (Number(salary.total || 0) - calculateDeduction()).toFixed(2);
    };

    return (
        <div className="border border-stroke p-5 mb-5">
            <div className="flex justify-between mb-4">
                <div>
                    <h5 className="text-xl font-bold">{salary.users?.name || 'N/A'}</h5>
                    <p>Username: {salary.users?.name || 'N/A'}</p>
                    <p>Branch: {salary.users?.AttendBranch?.team || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p>Total Hours: {salary.overTimeHour || 'N/A'} hrs</p>
                    <p>Total Working Days: {salary.workingDay || 'N/A'} days</p>
                </div>
            </div>

            <div className="border-t border-stroke pt-4">
                <h5 className="text-lg font-bold">Salary Breakdown</h5>

                {/* Basic Information */}
                {[
                    { label: 'Basic Day Salary', value: salary.perDay },
                    { label: 'Basic Salary', value: salary.total },
                    { label: 'Overtime', value: salary.overTime },
                    { label: 'Bonus', value: salary.bonus },
                    { label: 'Allowance', value: salary.allowance },
                    { label: 'Cover', value: salary.cover }
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                        <p>{label}:</p>
                        <p className="text-right">${value || 'N/A'}</p>
                    </div>
                ))}

                {/* Deductions Section */}
                <div className="border-t border-stroke mt-4" style={{ color: 'red' }}>
                    <p>*Absent 2Day -Basic Day Salary</p>
                    <ul>
                        {result.dataAbsent.map((e, index) => (
                            <li key={index} className="text-right">
                                Fine RM{2 * (salary.perDay || 0)} Date {new Date(e.dates).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>

                    {/* Late Records */}
                    <p className="border-t border-stroke mt-4">*Lateness:</p>
                    <ul>
                        {result.dataLate.map((e, index) => (
                            <li key={index} className="text-right">
                                Fine RM{e.fine} Date {new Date(e.dates).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>

                    {/* Clock In/Out Records */}
                    <p className="border-t border-stroke mt-4">*Not Clocked in Or Not Clocked out:</p>
                    <ul>
                        {result.No_ClockIn_ClockOut.map((e, index) => (
                            <li key={index} className="text-right">
                                Fine RM{e.fine} Date {new Date(e.dates).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>

                    {/* <p className="border-t border-stroke mt-4">*Not Clocked out:</p>
                    <ul>
                        {result.notClockOut.map((e, index) => (
                            <li key={index} className="text-right">
                                Fine RM{e.fine} Date {new Date(e.dates).toLocaleDateString()}
                            </li>
                        ))}
                    </ul> */}
                </div>

                {/* Total Deductions */}
                <div className="border-t border-stroke mt-4 flex justify-between mt-4">
                    <p>Deduction:</p>
                    <p className="text-right text-red-500">-${calculateDeduction()}</p>
                </div>

                {/* Final Total */}
                <div className="border-t border-stroke mt-10 pt-4 flex justify-between font-bold">
                    <p>Total Salary:</p>
                    <p className="text-right">${calculateTotal()}</p>
                </div>
            </div>
        </div>
    );
};