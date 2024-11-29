"use client";
import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { Invoice } from "@/types/product";
import { SalaryUser, userInvoice } from "@/types/salary";
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import { useIdStore } from "@/lib/zudstand/salary";
import axios from "axios";
import useSWR from "swr";
import { AttendanceResult, SalaryRecord } from "@/types/salary2";
import { PayslipContent } from "../printInvoice";

import { Range, utils, writeFileXLSX } from "xlsx";
import ExcelJS from 'exceljs';
interface MultiInvoiceProp {
    datas: SalaryRecord[]
}

const MultiInvoiceTable = ({ datas }: MultiInvoiceProp) => {
    console.log("🚀 ~ datas:", datas)
    const payslipRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);


    const itemsPerPage = 1;


    const totalPages = Math.ceil(datas.length / itemsPerPage);

    const currentData = datas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    console.log("🚀 ~ currentData:", currentData)


    // Function to save the payslip as PDF
    const handleSavePDF = () => {
        const element = payslipRef.current;
        if (element) {
            const opt = {
                margin: [10, 0, 10, 0], // Adjust the margins for the PDF output
                filename: 'payslip.pdf',
                html2canvas: { scale: 2 }, // Higher scale for better quality
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };
            html2pdf().set(opt).from(element).save();
        }
    };

    const generatePDF = (isAll = false) => {
        const usersToProcess = isAll ? datas : currentData;

        usersToProcess.forEach((item) => {
            // Create a temporary container
            const container = document.createElement('div');

            // Use createRoot from react-dom/client
            const root = createRoot(container);
            root.render(<PayslipContent data={item} />);

            // Wait for the content to be rendered
            setTimeout(() => {
                const opt = {
                    margin: [10, 0, 10, 0],
                    filename: `payslip_${item.salary.users?.name || 'unknown'}.pdf`,
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        logging: false
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    }
                };

                html2pdf()
                    .set(opt)
                    .from(container)
                    .save()
                    .then(() => {
                        root.unmount();
                        container.remove();
                    });
            }, 100);
        });
    };
    const getDate = (data: AttendanceResult, type: string, perDay: number) => {
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
            data.No_ClockIn_ClockOut.map((e) => {
                let dd = e.dates.getDate()
                d.push(dd);
                totals = totals + e.fine!
            })
            const lateNumbers: string = `No clock in or out * ${d.join(', ')} RM${totals}`;
            return lateNumbers
        } else if (type == "Absent") {
            data.dataAbsent.map((e) => {
                let dd = e.dates.getDate();
                d.push(dd)
            })
            totals = data.dataAbsent.length * 2 * perDay;
            const lateNumbers: string = `Absent * ${d.join(', ')} RM${totals}`;
            return lateNumbers
        }
        return "1212"
    }

    // const saveAsExcel = () => {
    //     if (!datas.length) return;

    //     // Create worksheet data array
    //     const wsData: unknown[][] = [];

    //     // Add data for each employee with full headers
    //     datas.forEach((item, index) => {
    //         const { salary, result } = item;
    //         const startRow = wsData.length;
    //         const AbsentLength = result.dataAbsent.length
    //         // Add employee name as a header
    //         wsData.push([`${salary.year} - ${salary.month}`]);
    //         wsData.push([]); // Blank row after employee name

    //         // Add main headers
    //         wsData.push([
    //             "Name", "Day", "", "Basic", "Bonus", "Allow", "",
    //             "Advance", "Short", "Cover", "", "", "Total"
    //         ]);

    //         // Add sub-headers and data rows with merged name cell
    //         wsData.push([
    //             salary.users?.name, "底薪", "日", "实薪", "奖金", "津贴", "迟到 扣款",
    //             "借粮", "少/多", "加班 晚班", "交通 补贴", "M", "total"
    //         ]);

    //         wsData.push([
    //             "", // Empty cell for merged name
    //             salary.perDay || 0,
    //             salary.workingDay || 0,
    //             salary.perDay! * salary.workingDay! || 0,
    //             salary.bonus || 0,
    //             salary.allowance || 0,
    //             -(salary.fineLate! + salary.fineNoClockIn! + salary.fineNoClockOut! + (AbsentLength * 2 * salary.perDay!)) || 0,
    //             0,
    //             0,
    //             salary.overTime || 0,
    //             0,
    //             0,
    //             { f: `SUM(D${wsData.length + 1}:L${wsData.length + 1})` } // Add formula for total
    //         ]);

    //         // Add late information
    //         wsData.push([getDate(result, "Late")]);

    //         // Add no clock in/out information
    //         wsData.push([getDate(result, "NoInOut")]);

    //         // Add two blank rows between employees (except after the last one)
    //         if (index < datas.length - 1) {
    //             wsData.push([]);
    //             wsData.push([]);
    //         }
    //     });

    //     // Create a new workbook
    //     const wb = utils.book_new();

    //     // Create worksheet from the data array
    //     const ws = utils.aoa_to_sheet(wsData);

    //     // Set column widths
    //     const colWidths = Array(13).fill({ wch: 15 });
    //     ws['!cols'] = colWidths;

    //     // Add merged cells for each employee section
    //     const merges: Range[] | undefined = [];
    //     let currentRow = 0;

    //     datas.forEach((_, index) => {
    //         // Calculate the row where headers start (skipping employee name and blank row)
    //         const headerRow = currentRow + 2;
    //         const dataStartRow = currentRow + 3;

    //         // Merge cells for "Day" (columns B-C)
    //         merges.push({
    //             s: { r: headerRow, c: 1 },
    //             e: { r: headerRow, c: 2 }
    //         });

    //         // Merge cells for "Allow" (columns F-G)
    //         merges.push({
    //             s: { r: headerRow, c: 5 },
    //             e: { r: headerRow, c: 6 }
    //         });

    //         // Merge cells for "Cover" (columns J-L)
    //         merges.push({
    //             s: { r: headerRow, c: 9 },
    //             e: { r: headerRow, c: 11 }
    //         });

    //         // Merge name cells vertically (first column)
    //         merges.push({
    //             s: { r: dataStartRow, c: 0 },
    //             e: { r: dataStartRow + 1, c: 0 }
    //         });

    //         // Merge late info cells across all columns
    //         merges.push({
    //             s: { r: dataStartRow + 2, c: 0 },
    //             e: { r: dataStartRow + 2, c: 12 }
    //         });

    //         // Merge no clock in/out info cells across all columns
    //         merges.push({
    //             s: { r: dataStartRow + 3, c: 0 },
    //             e: { r: dataStartRow + 3, c: 12 }
    //         });

    //         // Move to next section (including the two new rows for late and no clock info)
    //         currentRow += 9;
    //     });

    //     // Add merges to worksheet
    //     ws['!merges'] = merges;

    //     // Add borders and styles to cells
    //     const range = utils.decode_range(ws['!ref'] || "A1");
    //     for (let R = range.s.r; R <= range.e.r; R++) {
    //         for (let C = range.s.c; C <= range.e.c; C++) {
    //             const cell_address = utils.encode_cell({ r: R, c: C });
    //             if (!ws[cell_address]) continue;

    //             if (!ws[cell_address].s) ws[cell_address].s = {};

    //             // Determine alignment based on row content
    //             const isHeader = R % 9 === 0 || R % 9 === 2;
    //             const isNumericRow = R % 9 === 3;

    //             ws[cell_address].s = {
    //                 ...ws[cell_address].s,
    //                 border: {
    //                     top: { style: 'thin', color: { rgb: "000000" } },
    //                     bottom: { style: 'thin', color: { rgb: "000000" } },
    //                     left: { style: 'thin', color: { rgb: "000000" } },
    //                     right: { style: 'thin', color: { rgb: "000000" } }
    //                 },
    //                 alignment: {
    //                     horizontal: isHeader ? 'center' : (isNumericRow ? 'left' : 'center'),
    //                     vertical: 'center'
    //                 }
    //             };

    //             // Add bold style to headers and employee name
    //             if (isHeader || R % 9 === 3) {
    //                 ws[cell_address].s.font = {
    //                     bold: true
    //                 };
    //             }
    //         }
    //     }

    //     // Add the worksheet to the workbook
    //     utils.book_append_sheet(wb, ws, "Payslips");

    //     // Write to XLSX
    //     writeFileXLSX(wb, "PayslipReport.xlsx");
    // }
    const saveAsExcel = async () => {
        if (!datas.length) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payslips');

        const addFormattedRows = (rowData: any[], options: {
            bold?: boolean,
            alignment?: Partial<ExcelJS.Alignment>
        } = {}) => {
            const row = worksheet.addRow(rowData);

            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                if (options.bold) {
                    cell.font = { bold: true };
                }

                cell.alignment = options.alignment || {
                    vertical: 'middle',
                    horizontal: 'center'
                };
            });

            return row;
        };

        datas.forEach((item, index) => {
            const { salary, result } = item;
            const AbsentLength = result.dataAbsent.length;

            // Track the starting row for each employee's data
            const startRowIndex = worksheet.rowCount + 1;

            // Employee name/period header
            addFormattedRows([`${salary.year} - ${salary.month}`], { bold: false });
            addFormattedRows([]); // Blank row

            // Main headers
            addFormattedRows([
                "Name", "Day", "", "Basic", "Bonus", "Allow", "",
                "Advance", "Short", "Cover", "", "", "Total"
            ], { bold: false });

            // Sub-headers
            addFormattedRows([
                salary.users?.name, "底薪", "日", "实薪", "奖金", "津贴", "迟到扣款",
                "借粮", "少/多", "加班晚班", "交通补贴", "M", "total"
            ], { bold: false });

            // Numeric data row (right-aligned)
            addFormattedRows([
                "", // Empty cell for merged name
                salary.perDay || 0,
                salary.workingDay || 0,
                salary.perDay! * salary.workingDay! || 0,
                salary.bonus || 0,
                salary.allowance || 0,
                -(salary.fineLate! + salary.fineNoClockIn! + salary.fineNoClockOut! + (AbsentLength * 2 * salary.perDay!)) || 0,
                0,
                0,
                salary.overTime || 0,
                0,
                0,
                0
            ], {
                alignment: {
                    vertical: 'middle',
                    horizontal: 'right'
                }
            });

            // Add absent, late, and no clock-in/out information
            addFormattedRows([getDate(result, "Absent", salary.perDay!)], { alignment: { horizontal: 'left' } });
            addFormattedRows([getDate(result, "Late", 0)], { alignment: { horizontal: 'left' } });
            addFormattedRows([getDate(result, "NoInOut", 0)], { alignment: { horizontal: 'left' } });

            // Merge cells for grouped headers
            worksheet.mergeCells(`A${startRowIndex + 3}`, `A${startRowIndex + 4}`);
            worksheet.mergeCells(`B${startRowIndex + 2}`, `C${startRowIndex + 2}`); // Merge "Day" columns
            worksheet.mergeCells(`F${startRowIndex + 2}`, `G${startRowIndex + 2}`); // Merge "Allow" columns
            worksheet.mergeCells(`J${startRowIndex + 2}`, `L${startRowIndex + 2}`); // Merge "Cover" columns
            worksheet.getCell(`M${startRowIndex + 4}`).value = {
                formula: `=SUM(D${startRowIndex + 4}:L${startRowIndex + 4})`
            };

            // Add two blank rows between employees (except after the last one)
            if (index < datas.length - 1) {
                addFormattedRows([]);
                addFormattedRows([]);
            }
        });

        // Adjust column widths
        worksheet.columns = [
            { width: 10 }, // Name
            { width: 10 }, // Day
            { width: 7 }, // Basic
            { width: 7 }, // Bonus
            { width: 10 }, // Allow
            { width: 7 }, // Advance
            { width: 5 }, // Short
            { width: 15 }, // Cover
            { width: 8 }, // Total
        ];

        // Save the file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'PayslipReport.xlsx';
        link.click();
    };


    // Merge cells for a given row range
    // const mergeCells = (start: string, end: string) => {
    //     worksheet.mergeCells(start, end);
    // };
    return (
        <div className="w-[1920px] h-[1280px] p-4 md:p-6 2xl:p-10 overflow-auto
           md:w-full md:h-auto rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            {/* Header with Save PDF button */}
            <div className="header flex justify-between mb-5">
                <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
                    Payslip
                </h4>
                <div className="flex gap-4">
                    {/* <button
                        onClick={() => generatePDF(false)}
                        className="inline-flex items-center gap-2.5 rounded bg-primary px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
                    >
                        Save as PDF
                    </button> */}

                    {/* <button
                        onClick={() => generatePDF(true)}
                        className="inline-flex items-center gap-2.5 rounded bg-green-600 px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
                    >
                        Save All
                    </button> */}
                    <button
                        className="inline-flex items-center gap-2.5 rounded bg-green-600 px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
                        onClick={() => saveAsExcel()}
                    >
                        Save All
                    </button>
                </div>

            </div>

            {/* Payslip details */}
            {currentData.map((item, index) => {
                const { salary, result } = item;
                console.log("sakarsd", salary)
                return (
                    <>
                        {/* Payslip details */}
                        <div key={index} ref={payslipRef} className="payslip-content">
                            {/* {invoiceData.map((invoice, index) => ( */}
                            <div className="border border-stroke p-5 mb-5">
                                <div className="flex justify-between mb-4">
                                    <div>
                                        <h5 className="text-xl font-bold">{salary.users?.name}</h5>
                                        <p>Username: {salary?.users?.name}</p>
                                        <p>Branch: {salary.users?.AttendBranch?.team}</p>
                                    </div>
                                    <div className="text-right">
                                        <p>Total Hours: {salary?.overTimeHour} hrs</p>
                                        <p>Total Working Days: {salary?.workingDay} days</p> {/* Moved here */}
                                    </div>
                                </div>
                                <div className="border-t border-stroke pt-4">
                                    <h5 className="text-lg font-bold">Salary Breakdown</h5>
                                    <div className="flex justify-between">
                                        <p>Basic Day Salary:</p>
                                        <p className="text-right">${salary?.perDay}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Basic Salary:</p>
                                        <p className="text-right">${salary.total}</p>  {/* Aligned right */}
                                    </div>

                                    <div className="flex justify-between">
                                        <p>Overtime:</p>
                                        <p className="text-right">${salary.overTime}</p> {/* Aligned right */}
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Bonus:</p>
                                        <p className="text-right">${salary.bonus}</p> {/* Aligned right */}
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Allowance:</p>
                                        <p className="text-right">${salary.allowance}</p> {/* Aligned right */}
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Cover:</p>
                                        <p className="text-right">${salary.cover}</p> {/* Aligned right */}
                                    </div>
                                    <br />
                                    <div className="border-t border-stroke mt-4" style={{ color: 'red' }}>
                                        <p>
                                            *Absent 2Day -Basic Day Salary
                                        </p>
                                        <ul>
                                            {result.dataAbsent.map((e, index) => (
                                                <>
                                                    <li key={index} className="text-right">
                                                        Fine RM{2 * salary.perDay!}    Date  {e.dates.toLocaleDateString()}
                                                    </li>
                                                </>
                                            ))}
                                        </ul>
                                        <p className="border-t border-stroke mt-4">*Lateness:</p>
                                        <ul>
                                            {
                                                result.dataLate.map((e, index) => (
                                                    <>
                                                        <li key={index} className="text-right">
                                                            Fine RM{e.fine}    Date  {e.dates.toLocaleDateString()}
                                                        </li>
                                                    </>
                                                ))
                                            }

                                        </ul>
                                        <p className="border-t border-stroke mt-4">*Not Clocked in Or Not Clocked out:</p>
                                        <ul>
                                            {result.No_ClockIn_ClockOut.map((e, index) => (
                                                <>
                                                    <li key={index} className="text-right">
                                                        Fine RM{e.fine}    Date  {e.dates.toLocaleDateString()}
                                                    </li>
                                                </>
                                            ))}
                                        </ul>
                                        {/* <p className="border-t border-stroke mt-4">*Not Clocked out:</p>
                                        <ul>
                                            {result.notClockOut.map((e, index) => (
                                                <>
                                                    <li key={index} className="text-right">
                                                        Fine RM{e.fine}    Date  {e.dates.toLocaleDateString()}
                                                    </li>
                                                </>
                                            ))}
                                        </ul> */}
                                        <br />
                                    </div>
                                    <div className="border-t border-stroke mt-4 flex justify-between">
                                        <p >Deduction:</p>
                                        <p className="text-right" style={{ color: 'red' }}>-${((result.dataAbsent.length * 2) * salary.perDay!) + salary.fineLate! + salary.fineNoClockIn! + salary.fineNoClockOut!}</p> {/* Aligned right */}
                                    </div>
                                    <div className="border-t border-stroke mt-10 pt-4 flex justify-between font-bold"> {/* Divider added here */}
                                        <p>Total Salary:</p>
                                        <p className="text-right">${(Number(salary.total ?? 0) - (
                                            ((result.dataAbsent?.length || 0) * 2) * Number(salary.perDay ?? 0) +
                                            Number(salary.fineLate ?? 0) +
                                            Number(salary.fineNoClockIn ?? 0) +
                                            Number(salary.fineNoClockOut ?? 0)
                                        )).toFixed(2)}</p> {/* Aligned right */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            })}
            {/* Pagination */}
            <div className="flex justify-between px-7.5 py-7">
                <div className="flex items-center">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium hover:bg-primary hover:text-white ${currentPage === i + 1 ? "bg-primary text-white" : ""
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white"
                    >
                        Next
                    </button>
                </div>
                <p className="font-medium">
                    Showing {currentPage} of {totalPages} pages
                </p>
            </div>
        </div>
    );
};

export default MultiInvoiceTable;
