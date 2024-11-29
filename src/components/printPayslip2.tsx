"use client"

import { AttendanceResult, SalaryRecord } from "@/types/salary2"
import { useRef } from "react";
import { Range, utils, writeFileXLSX } from "xlsx";

interface MultiInvoiceProp {
    data: SalaryRecord[]
}

export const Payslip2 = ({ data }: MultiInvoiceProp) => {
    const containerRef = useRef(null);

    const getDate = (data: AttendanceResult, type: string) => {
        let d: number[] = []
        let totals = 0;
        if (type == "Late") {
            data.dataLate.map((e) => {
                let dd = e.dates.getDate()
                d.push(dd);
                totals = totals + e.fine!
            })
            const lateNumbers: string = `Late * ${d.join(', ')} RM${totals}`;
            return lateNumbers
        } else if (type == "NoInOut") {
            data.dataLate.map((e) => {
                let dd = e.dates.getDate()
                d.push(dd);
                totals = totals + e.fine!
            })
            const lateNumbers: string = `No clock in or out * ${d.join(', ')} RM${totals}`;
            return lateNumbers
        }
        return "1212"
    }

    const OnSave = () => {
        if (!data.length) return;

        // Create worksheet data array
        const wsData: unknown[][] = [];

        // Add data for each employee with headers and styling
        data.forEach((item, index) => {
            const { salary, result } = item;

            // Add title
            wsData.push([`${salary.year} - ${salary.month}`]);
            wsData.push([]); // Blank row

            // Add headers
            wsData.push([
                "Name", "Day", "", "Basic", "Bonus", "Allow", "",
                "Advance", "Short", "Cover", "", "", "Total"
            ]);

            // Add sub-headers
            wsData.push([
                salary.users?.name, "底薪", "日", "实薪", "奖金", "津贴", "迟到\n扣款",
                "借粮", "少/多", "加班\n晚班", "交通\n补贴", "M", "total"
            ]);

            // Add employee data
            wsData.push([
                "", // Empty for merged name
                salary.perDay || "-",
                salary.workingDay || "-",
                salary.perDay || "-",
                salary.bonus || "-",
                salary.allowance || "-",
                salary.fineLate! + salary.fineNoClockIn! || "-",
                "-", "-", salary.overTime || "-", "-", "-",
                salary.total || "-"
            ]);

            // Add late and no clock information
            wsData.push([getDate(result, "Late")]);
            wsData.push([getDate(result, "NoInOut")]);

            // Add spacing between employees
            if (index < data.length - 1) {
                wsData.push([]);
            }
        });

        // Create a new workbook
        const wb = utils.book_new();
        const ws = utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, // Name
            { wch: 10 }, // Day
            { wch: 10 }, // Basic
            { wch: 10 }, // Bonus
            { wch: 10 }, // Allow
            { wch: 10 }, // Advance
            { wch: 10 }, // Short
            { wch: 10 }, // Cover
            { wch: 10 }, // Total
        ];

        // Define merges
        const merges: Range[] = [
            { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, // Merge Day headers
            { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } }, // Merge Allow headers
            { s: { r: 2, c: 9 }, e: { r: 2, c: 11 } }, // Merge Cover headers
        ];
        ws['!merges'] = merges;

        // Add cell styles
        const range = utils.decode_range(ws['!ref'] || "A1");
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cell = utils.encode_cell({ r: R, c: C });
                if (!ws[cell]) continue;

                ws[cell].s = {
                    font: { name: "Arial", sz: 10 },
                    alignment: { horizontal: "center", vertical: "center", wrapText: true },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" },
                    },
                };
            }
        }

        // Add worksheet to workbook and export
        utils.book_append_sheet(wb, ws, "Payslip");
        writeFileXLSX(wb, "PayslipReport.xlsx");
    };

    return (
        <>
            <div className="bg-white p-4 w-full">
                <button
                    className="btn mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={OnSave}
                >
                    Save to Excel
                </button>

                <div ref={containerRef}>
                    {data.map((item, index) => {
                        const { salary, result } = item;
                        const total = salary.total! - salary.fineLate! - salary.fineNoClockIn!

                        return (
                            <div key={index} className="mb-8">
                                <h2 className="text-lg font-bold mb-2">{salary.year} - {salary.month} </h2>
                                <table className="w-full mb-2">
                                    <thead>
                                        <tr className="border border-black">
                                            <th className="border-r-2 border-l-2 border-black">Name</th>
                                            <th colSpan={2} className="border-r-2 border-l-2 border-black">Day</th>
                                            <th className="border-r-2 border-l-2 border-black">Basic</th>
                                            <th className="border-r-2 border-l-2 border-black">Bonus</th>
                                            <th className="border-r-2 border-l-2 border-black" colSpan={2}>Allow</th>
                                            <th className="border-r-2 border-l-2 border-black">Advance</th>
                                            <th className="border-r-2 border-l-2 border-black">Short</th>
                                            <th className="border-r-2 border-l-2 border-black" colSpan={3}>Cover</th>
                                            <th className="border-r-2 border-l-2 border-black">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border border-black">
                                            <td rowSpan={2} className="border-r-2 border-l-2 border-black">
                                                {salary.users?.name}
                                            </td>
                                            <td className="border-r-2 border-l-2 border-black">底薪</td>
                                            <td className="border-r-2 border-l-2 border-black">日</td>
                                            <td className="border-r-2 border-l-2 border-black">实薪</td>
                                            <td className="border-r-2 border-l-2 border-black">奖金</td>
                                            <td className="border-r-2 border-l-2 border-black">津贴</td>
                                            <td className="border-r-2 border-l-2 border-black">迟到<br />扣款</td>
                                            <td className="border-r-2 border-l-2 border-black">借粮</td>
                                            <td className="border-r-2 border-l-2 border-black">少/多</td>
                                            <td className="border-r-2 border-l-2 border-black">加班<br />晚班</td>
                                            <td className="border-r-2 border-l-2 border-black">交通<br />补贴</td>
                                            <td className="border-r-2 border-l-2 border-black">M</td>
                                            <td className="border-r-2 border-l-2 border-black">total</td>
                                        </tr>
                                        <tr className="border border-black">
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.perDay || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.workingDay || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.perDay || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.bonus || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.allowance || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.fineLate! + salary.fineNoClockIn! || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{'-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{'-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{salary.overTime || '-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{'-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{'-'}</td>
                                            <td className="border-r-2 border-l-2 border-black p-2">{total || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={13} className="border-r-2 border-l-2 border-black p-2">
                                                {getDate(result, "Late")}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={13} className="border-r-2 border-l-2 border-black p-2">
                                                {getDate(result, "NoInOut")}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}