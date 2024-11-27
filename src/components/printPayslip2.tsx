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

        // Add data for each employee with full headers
        data.forEach((item, index) => {
            const { salary, result } = item;
            const startRow = wsData.length;

            // Add employee name as a header
            wsData.push([`${salary.year} - ${salary.month}`]);
            wsData.push([]); // Blank row after employee name

            // Add main headers
            wsData.push([
                "Name", "Day", "", "Basic", "Bonus", "Allow", "",
                "Advance", "Short", "Cover", "", "", "Total"
            ]);

            // Add sub-headers and data rows with merged name cell
            wsData.push([
                salary.users?.name, "底薪", "日", "实薪", "奖金", "津贴", "迟到 扣款",
                "借粮", "少/多", "加班 晚班", "交通 补贴", "M", "total"
            ]);

            wsData.push([
                "", // Empty cell for merged name
                salary.perDay || 0,
                salary.perDay || 0,
                salary.perDay || 0,
                salary.bonus || 0,
                salary.allowance || 0,
                salary.fineLate || 0,
                salary.perDay || 0,
                salary.perDay || 0,
                salary.perDay || 0,
                salary.perDay || 0,
                salary.perDay || 0,
                { f: `SUM(B${wsData.length + 1}:L${wsData.length + 1})` } // Add formula for total
            ]);

            // Add late information
            wsData.push([getDate(result, "Late")]);

            // Add no clock in/out information
            wsData.push([getDate(result, "NoInOut")]);

            // Add two blank rows between employees (except after the last one)
            if (index < data.length - 1) {
                wsData.push([]);
                wsData.push([]);
            }
        });

        // Create a new workbook
        const wb = utils.book_new();

        // Create worksheet from the data array
        const ws = utils.aoa_to_sheet(wsData);

        // Set column widths
        const colWidths = Array(13).fill({ wch: 15 });
        ws['!cols'] = colWidths;

        // Add merged cells for each employee section
        const merges: Range[] | undefined = [];
        let currentRow = 0;

        data.forEach((_, index) => {
            // Calculate the row where headers start (skipping employee name and blank row)
            const headerRow = currentRow + 2;
            const dataStartRow = currentRow + 3;

            // Merge cells for "Day" (columns B-C)
            merges.push({
                s: { r: headerRow, c: 1 },
                e: { r: headerRow, c: 2 }
            });

            // Merge cells for "Allow" (columns F-G)
            merges.push({
                s: { r: headerRow, c: 5 },
                e: { r: headerRow, c: 6 }
            });

            // Merge cells for "Cover" (columns J-L)
            merges.push({
                s: { r: headerRow, c: 9 },
                e: { r: headerRow, c: 11 }
            });

            // Merge name cells vertically (first column)
            merges.push({
                s: { r: dataStartRow, c: 0 },
                e: { r: dataStartRow + 1, c: 0 }
            });

            // Merge late info cells across all columns
            merges.push({
                s: { r: dataStartRow + 2, c: 0 },
                e: { r: dataStartRow + 2, c: 12 }
            });

            // Merge no clock in/out info cells across all columns
            merges.push({
                s: { r: dataStartRow + 3, c: 0 },
                e: { r: dataStartRow + 3, c: 12 }
            });

            // Move to next section (including the two new rows for late and no clock info)
            currentRow += 9;
        });

        // Add merges to worksheet
        ws['!merges'] = merges;

        // Add borders and styles to cells
        const range = utils.decode_range(ws['!ref'] || "A1");
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cell_address = utils.encode_cell({ r: R, c: C });
                if (!ws[cell_address]) continue;

                if (!ws[cell_address].s) ws[cell_address].s = {};

                // Add borders to all non-empty cells
                ws[cell_address].s = {
                    ...ws[cell_address].s,
                    border: {
                        top: { style: 'thin', color: { rgb: "000000" } },
                        bottom: { style: 'thin', color: { rgb: "000000" } },
                        left: { style: 'thin', color: { rgb: "000000" } },
                        right: { style: 'thin', color: { rgb: "000000" } }
                    },
                    alignment: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                };

                // Add bold style to headers and employee name
                if (R % 9 === 0 || R % 9 === 2 || R % 9 === 3) {
                    ws[cell_address].s.font = {
                        bold: true
                    };
                }
            }
        }

        // Add the worksheet to the workbook
        utils.book_append_sheet(wb, ws, "Payslips");

        // Write to XLSX
        writeFileXLSX(wb, "PayslipReport.xlsx");
    }

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
                                            <td className="border-r-2 border-l-2 border-black">迟到 扣款</td>
                                            <td className="border-r-2 border-l-2 border-black">借粮</td>
                                            <td className="border-r-2 border-l-2 border-black">少/多</td>
                                            <td className="border-r-2 border-l-2 border-black">加班 晚班</td>
                                            <td className="border-r-2 border-l-2 border-black">交通 补贴</td>
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