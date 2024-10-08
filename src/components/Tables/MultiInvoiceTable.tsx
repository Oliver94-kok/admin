"use client";
import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { Invoice } from "@/types/product";
import { SalaryUser, userInvoice } from "@/types/salary";
import { useSalaryStore } from "@/lib/zudstand/salary";
import jsPDF from 'jspdf';



const MultiInvoiceTable = () => {
  const payslipRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { salaryUsers, loadSalaryUsersFromStorage, saveSalaryUsersToStorage } = useSalaryStore();
  const itemsPerPage = 1;
  useEffect(() => {
    loadSalaryUsersFromStorage()
  }, [loadSalaryUsersFromStorage])

  // Save data to localStorage when the data changes  
  useEffect(() => {
    if (salaryUsers) {
      saveSalaryUsersToStorage()
    }
  }, [salaryUsers, saveSalaryUsersToStorage])

  if (!salaryUsers) return (<>error</>)
  const totalPages = Math.ceil(salaryUsers.length / itemsPerPage);
  const currentData = salaryUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );



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
  const generatePDF = () => {
    // Loop through the salaryUsers array and generate a PDF for each user  
    salaryUsers.forEach((salary) => {
      const opt = {
        margin: [10, 0, 10, 0], // Adjust the margins for the PDF output  
        filename: `payslip_${salary.users?.name || 'unknown'}.pdf`,
        html2canvas: { scale: 2 }, // Higher scale for better quality  
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // Create a new html2pdf instance  
      const doc = html2pdf().set(opt);

      // Create a new element and populate it with the salary data  
      const element = document.createElement('div');
      element.innerHTML = `  
        <div class="border border-stroke p-5 mb-5">  
          <div class="flex justify-between mb-4">  
            <div>  
              <h5 class="text-xl font-bold">${salary.users?.name || 'N/A'}</h5>  
              <p>Username: ${salary.users?.username || 'N/A'}</p>  
              <p>Branch: ${salary.users?.name || 'N/A'}</p>  
            </div>  
            <div class="text-right">  
              <p>Total Hours: ${salary.allowance || 'N/A'} hrs</p>  
              <p>Total Working Days: ${salary.workingDay || 'N/A'} days</p>  
            </div>  
          </div>  
          <div class="border-t border-stroke pt-4">  
            <h5 class="text-lg font-bold">Salary Breakdown</h5>  
            <div class="flex justify-between">  
              <p>Basic Day Salary:</p>  
              <p class="text-right">${salary.perDay || 'N/A'}</p>  
            </div>  
            <div class="flex justify-between">  
              <p>Overtime:</p>  
              <p class="text-right">${salary.overTime || 'N/A'}</p>  
            </div>  
            <div class="flex justify-between">  
              <p>Deduction:</p>  
              <p class="text-right">-${salary.fine || 'N/A'}</p>  
            </div>  
            <div class="flex justify-between">  
              <p>Allowance:</p>  
              <p class="text-right">${salary.allowance || 'N/A'}</p>  
            </div>  
            <div class="border-t border-stroke mt-4 pt-4 flex justify-between font-bold">  
              <p>Total Salary:</p>  
              <p class="text-right">${salary.total || 'N/A'}</p>  
            </div>  
          </div>  
        </div>  
      `;

      // Add the element to the PDF and save it  
      doc.from(element).save();
    });
  };

  return (
    <div className=" min-w-full rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header with Save PDF button */}
      <div className="header flex justify-between mb-5">
        <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
          Payslip
        </h4>
        <div className="flex gap-4">
          <button
            onClick={() => generatePDF()}
            className="inline-flex items-center gap-2.5 rounded bg-primary px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
          >
            Save as PDF
          </button>
        </div>
      </div>

      {/* Payslip details */}
      {currentData.map((salary) => (
        <>
          {/* Payslip details */}
          <div ref={payslipRef} className="payslip-content">
            {/* {invoiceData.map((invoice, index) => ( */}
            <div className="border border-stroke p-5 mb-5">
              <div className="flex justify-between mb-4">
                <div>
                  <h5 className="text-xl font-bold">{salary?.users?.name}</h5>
                  <p>Username: {salary?.users?.username}</p>
                  <p>Branch: {salary?.late}</p>
                </div>
                <div className="text-right">
                  <p>Total Hours: {salary?.workingDay} hrs</p>
                  <p>Total Working Days: {salary?.workingDay} days</p> {/* Moved here */}
                </div>
              </div>
              <div className="border-t border-stroke pt-4">
                <h5 className="text-lg font-bold">Salary Breakdown</h5>
                <div className="flex justify-between">
                  <p>Basic Day Salary:</p>
                  <p className="text-right">${salary?.perDay}</p>
                </div>
                {/* <div className="flex justify-between">
                <p>Allowance:</p>
                <p className="text-right">${invoice.allowance}</p>  Aligned right 
              </div>  */}

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
                <div style={{ color: 'red' }}>
                  <p>
                    *Absent 2Day -Basic Day Salary
                  </p>
                  <p>*Lateness:</p>
                  <ul>
                    {/* {lateEntries.map((entry, index) => (
                      <li key={index}>
                        {entry.date} {entry.reason} {entry.penalty}
                      </li>
                    ))} */}
                  </ul>
                  <p>*Not Clocked in:</p>
                  <ul>
                    {/* {notClockedInEntries.map((entry, index) => (
                      <li key={index}>
                        {entry.date} {entry.reason} {entry.penalty}
                      </li>
                    ))} */}
                  </ul>
                  <br />
                </div>
                <div className="flex justify-between">
                  <p >Deduction:</p>
                  <p className="text-right" style={{ color: 'red' }}>-${salary.fine}</p> {/* Aligned right */}
                </div>
                <div className="border-t border-stroke mt-10 pt-4 flex justify-between font-bold"> {/* Divider added here */}
                  <p>Total Salary:</p>
                  <p className="text-right">${salary.total}</p> {/* Aligned right */}
                </div>
              </div>
            </div>
          </div>
        </>
      ))}
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
