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
                    horizontal: 'center',
                    wrapText: true
                };
            });

            return row;
        };

        datas.forEach((item, index) => {
            const { salary, result } = item;
            const AbsentLength = result.dataAbsent.length;

            const startRowIndex = worksheet.rowCount + 1;

            // Add Main Header (e.g., "2024 - 12")
            addFormattedRows([`${salary.year} - ${salary.month}`], { bold: true });

            // Add Section Header (e.g., "B372")
            addFormattedRows([`${salary.users?.AttendBranch?.branch}`, "Day", "", "Basic", "Bonus", "Allow", "",
                "Advance", "Short", "Cover", "", "", "Total"
            ], { bold: true });

            // Merge cells for Main Headers
            worksheet.mergeCells(`B${startRowIndex + 1}:C${startRowIndex + 1}`); // Merge "Day"
            worksheet.mergeCells(`F${startRowIndex + 1}:G${startRowIndex + 1}`); // Merge "Allow"
            worksheet.mergeCells(`J${startRowIndex + 1}:L${startRowIndex + 1}`); // Merge "Cover"


            // Add employee section
            addFormattedRows([`${salary.year} - ${salary.month}`], { bold: true });


            // Merge cells for Main Headers
            worksheet.mergeCells(`B${startRowIndex + 1}:C${startRowIndex + 1}`); // Merge "Day"
            worksheet.mergeCells(`F${startRowIndex + 1}:G${startRowIndex + 1}`); // Merge "Allow"
            worksheet.mergeCells(`J${startRowIndex + 1}:L${startRowIndex + 1}`); // Merge "Cover"

            // Add Sub-Headers
            addFormattedRows([
                salary.users?.name, "底薪", "日", "实薪", "奖金", "津贴", "迟到\n扣款",
                "借粮", "少/多", "加班\n晚班", "交通\n补贴", "M", "total"
            ], { alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } });

            // Merge cells for Sub-Headers
            worksheet.mergeCells(`A${startRowIndex + 2}:A${startRowIndex + 3}`);
            worksheet.mergeCells(`M${startRowIndex + 2}:M${startRowIndex + 3}`);


            // Numeric data row
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
                salary.total || 0
            ], { alignment: { horizontal: 'center', vertical: 'middle', } });

            // Merge cells for Totals row
            worksheet.mergeCells(`A${startRowIndex + 4}:M${startRowIndex + 4}`);
            worksheet.getCell(`M${startRowIndex + 3}`).value = {
                formula: `=SUM(D${startRowIndex + 3}:L${startRowIndex + 3})`,
            };

            // Add Absence and Fine Details
            addFormattedRows([getDate(result, "Absent", salary.perDay!)], { alignment: { horizontal: 'left' } });
            addFormattedRows([`${getDate(result, "Late", 0)} ${getDate(result, "NoInOut", 0)}`], {
                alignment: { horizontal: 'left', wrapText: true },
            });

            // Customize Row Heights
            worksheet.getRow(startRowIndex).height = 24; // Header row height
            worksheet.getRow(startRowIndex + 1).height = 24; // Sub-header
            worksheet.getRow(startRowIndex + 2).height = 24; // Numeric data

            // Customize Column Widths
            worksheet.getColumn("B").width = 6.57;
            worksheet.getColumn("C").width = 5.14;
            worksheet.getColumn("D").width = 7;
            worksheet.getColumn("E").width = 7.14;
            worksheet.getColumn("F").width = 7;
            worksheet.getColumn("G").width = 7.57;
            worksheet.getColumn("H").width = 9.14;
            worksheet.getColumn("I").width = 5.43;
            worksheet.getColumn("J").width = 6.43;
            worksheet.getColumn("K").width = 6;
            worksheet.getColumn("L").width = 5.71;
            worksheet.getColumn("M").width = 8.71;
        });

        // Save workbook
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
