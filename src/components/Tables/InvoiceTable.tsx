"use client";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Invoice } from "@/types/product";

const invoiceData: Invoice[] = [
  {
    name: "John Doe",
    username: "001",
    branches: "Perling",
    workinghours: 80,
    bday: 50,
    bmonth: 500,
    allowance: 150, // Added allowance
    totalday: 10,
    late: -100,
    totalsal: 400,
  },
  // Add more data as needed
];

const InvoiceTable = () => {
  const payslipRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-[1280px] rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header with Save PDF button */}
      <div className="header flex justify-between mb-5">
        <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
          Payslip
        </h4>
        <div className="flex gap-4">
          <button
            onClick={handleSavePDF}
            className="inline-flex items-center gap-2.5 rounded bg-primary px-4 py-[7px] font-medium text-white hover:bg-opacity-90"
          >
            Save as PDF
          </button>
        </div>
      </div>

      {/* Payslip details */}
      <div ref={payslipRef} className="payslip-content">
        {invoiceData.map((invoice, index) => (
          <div key={index} className="border border-stroke p-5 mb-5">
            <div className="flex justify-between mb-4">
              <div>
                <h5 className="text-xl font-bold">{invoice.name}</h5>
                <p>Username: {invoice.username}</p>
                <p>Branch: {invoice.branches}</p>
              </div>
              <div className="text-right">
                <p>Total Hours: {invoice.workinghours} hrs</p>
                <p>Total Working Days: {invoice.totalday} days</p> {/* Moved here */}
              </div>
            </div>
            <div className="border-t border-stroke pt-4">
              <h5 className="text-lg font-bold">Salary Breakdown</h5>
              <div className="flex justify-between">
                <p>Basic Day Salary:</p>
                <p className="text-right">${invoice.bday}</p>
              </div>
              <div className="flex justify-between">
                <p>Basic Monthly Salary:</p>
                <p className="text-right">${invoice.bmonth}</p> {/* Aligned right */}
              </div>
              <div className="flex justify-between">
                <p>Allowance:</p>
                <p className="text-right">${invoice.allowance}</p> {/* Aligned right */}
              </div>
              <div className="flex justify-between">
                <p>Late Deduction:</p>
                <p className="text-right">${invoice.late}</p> {/* Aligned right */}
              </div>
              <div className="border-t border-stroke mt-10 pt-4 flex justify-between font-bold"> {/* Divider added here */}
                <p>Total Salary:</p>
                <p className="text-right">${invoice.totalsal}</p> {/* Aligned right */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceTable;