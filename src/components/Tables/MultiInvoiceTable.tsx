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
import { SalaryRecord } from "@/types/salary2";
import { PayslipContent } from "../printInvoice";
const fetcher = async (url: string, ids: string[]) => {
    const response = await axios.post(url, { data: ids });
    return response.data.results;
};

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
    // const generatePDF = (isAll = false) => {
    //     const usersToProcess = datas ? datas : currentData;
    //     // Loop through the salaryUsers array and generate a PDF for each user
    //     usersToProcess.forEach((item) => {
    //         const { salary, result } = item;
    //         const opt = {
    //             margin: [10, 0, 10, 0], // Adjust the margins for the PDF output
    //             filename: `payslip_${salary.users?.name || 'unknown'}.pdf`,
    //             html2canvas: { scale: 2 }, // Higher scale for better quality
    //             jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    //         };

    //         // Create a new html2pdf instance
    //         const doc = html2pdf().set(opt);

    //         // Create a new element and populate it with the salary data
    //         const element = document.createElement('div');
    //         element.innerHTML = `
    //     <div class="border border-stroke p-5 mb-5">
    //       <div class="flex justify-between mb-4">
    //         <div>
    //           <h5 class="text-xl font-bold">${salary.users?.name || 'N/A'}</h5>
    //           <p>Username: ${salary.users?.name || 'N/A'}</p>
    //           <p>Branch: ${salary.users?.name || 'N/A'}</p>
    //         </div>
    //         <div class="text-right">
    //           <p>Total Hours: ${salary.overTimeHour || 'N/A'} hrs</p>
    //           <p>Total Working Days: ${salary.workingDay || 'N/A'} days</p>
    //         </div>
    //       </div>
    //       <div class="border-t border-stroke pt-4">
    //         <h5 class="text-lg font-bold">Salary Breakdown</h5>
    //         <div class="flex justify-between">
    //           <p>Basic Day Salary:</p>
    //           <p class="text-right">${salary.perDay || 'N/A'}</p>
    //         </div>
    //         <div class="flex justify-between">
    //           <p>Overtime:</p>
    //           <p class="text-right">${salary.overTime || 'N/A'}</p>
    //         </div>
    //          <div class="flex justify-between">
    //           <p>Bonus:</p>
    //           <p class="text-right">${salary.bonus || 'N/A'}</p>
    //         </div>
    //         <div class="flex justify-between">
    //           <p>Allowance:</p>
    //           <p class="text-right">${salary.allowance || 'N/A'}</p>
    //         </div>
    //         <div class="flex justify-between">
    //           <p>Cover:</p>
    //           <p class="text-right">${salary.cover || 'N/A'}</p>
    //         </div>
    //         <br />
    //         <div style="color: red;">
    //           <p>
    //             *Absent 2Day -Basic Day Salary
    //           </p>
    //            <ul>
    //                                         ${result.dataAbsent.map((e, index) => (
    //             <>
    //                 <li key={index} className="text-right">
    //                     Fine RM{2 * salary.perDay!}    Date  {e.dates.toLocaleDateString()}
    //                 </li>
    //             </>
    //         ))}
    //                                     </ul>
    //           <p>*Lateness:</p>
    //             <ul>
    //                                         ${result.dataLate.map((e, index) => (
    //             <>
    //                 <li key={index} className="text-right">
    //                     Fine RM{e.fine}    Date  {e.dates.toLocaleDateString()}
    //                 </li>
    //             </>
    //         ))
    //             }

    //                                     </ul>
    //           <p>*Not Clocked in:</p>
    //           <ul>
    //                                        ${result.notClockIn.map((e, index) => (
    //                 <>
    //                     <li key={index} className="text-right">
    //                         Fine RM{e.fine}    Date  {e.dates.toLocaleDateString()}
    //                     </li>
    //                 </>
    //             ))}
    //                                     </ul>
    //           <p>*Not Clocked out:</p>
    //             <ul>
    //                                         ${result.notClockOut.map((e, index) => (
    //                 <>
    //                     <li key={index} className="text-right">
    //                         Fine RM{e.fine}    Date  {e.dates.toLocaleDateString()}
    //                     </li>
    //                 </>
    //             ))}
    //                                     </ul>
    //           <br />
    //         </div>
    //         <div class="flex justify-between">
    //           <p >Deduction:</p>
    //           <p class="text-right" style="color: red;">-${((result.dataAbsent.length * 2) * salary.perDay!) + salary.fineLate! + salary.fineNoClockIn! + salary.fineNoClockOut!}</p>
    //         </div>
    //         <div class="border-t border-stroke mt-10 pt-4 flex justify-between font-bold">
    //           <p>Total Salary:</p>
    //           <p class="text-right">${(Number(salary.total ?? 0) - (
    //                 ((result.dataAbsent?.length || 0) * 2) * Number(salary.perDay ?? 0) +
    //                 Number(salary.fineLate ?? 0) +
    //                 Number(salary.fineNoClockIn ?? 0) +
    //                 Number(salary.fineNoClockOut ?? 0)
    //             )).toFixed(2)}</p>
    //         </div>
    //       </div>
    //     </div>
    //   `;

    //         // Add the element to the PDF and save it
    //         doc.from(element).save();
    //     });
    // };
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
    return (
        <div className="w-[1920px] h-[1280px] p-4 md:p-6 2xl:p-10 overflow-auto
           md:w-full md:h-auto rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            {/* Header with Save PDF button */}
            <div className="header flex justify-between mb-5">
                <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
                    Payslip
                </h4>
                <div className="flex gap-4">
                    <button
                        onClick={() => generatePDF(false)}
                        className="inline-flex items-center gap-2.5 rounded bg-primary px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
                    >
                        Save as PDF
                    </button>

                    <button
                        onClick={() => generatePDF(true)}
                        className="inline-flex items-center gap-2.5 rounded bg-green-600 px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
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
                                        <p className="border-t border-stroke mt-4">*Not Clocked in:</p>
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
