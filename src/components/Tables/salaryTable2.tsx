
'use client'

import { initialSalaryState, salaryReducer } from "@/lib/salaryReducer";
import { SalaryUser } from "@/types/salary";
import Image from "next/image";
import axios from "axios";
import { DateTime } from "luxon";
import { useSession } from "next-auth/react";
import { useEffect, useReducer, useState } from "react";
import useSWR from "swr";
import { Loader2 } from "../common/loader2/loader2";
import { getLocale } from "@/locales/dictionary";
import { ComponentSalary } from "../Form/componentSalary";
import { typeComponentSalary } from "./SalaryTable";
import Modal from "../modal";
import BonusPopupv2 from "../Form/bonuspopupv2";
import AdvancePopupv2 from "../Form/advancepopupv2";
import AllowPopupv2 from "../Form/allowpopupv2";
import MPopupv2 from "../Form/mpopupv2";
import OTPopupv2 from "../Form/otpopupv2";
import ShortPopupv2 from "../Form/shortpopupv2";
import TransportPopupv2 from "../Form/transportpopupv2";
import { AddAdvance, delAdvance } from "@/action/salaryAdvance";
import { AddAllow, delAllow } from "@/action/salaryAllow";
import { AddBonus, delBonus } from "@/action/salaryBonus";
import { AddM, delM } from "@/action/salaryM";
import { AddOverTime, delOvetime } from "@/action/salaryOt";
import { AddShort, delShort } from "@/action/salaryShort";
import { AddTransport, delTransport } from "@/action/salaryTransport";
import { toast } from "react-toastify";
import { useSalaryStore } from "@/lib/zudstand/salaryv2";
import { AttendanceResult } from "@/types/salary2";
import { excelData } from "@/data/salary";
import ExcelJS from 'exceljs';
import LoadingButton from "../Buttons/loadingButton";
import { addPerDay } from "@/action/addperDay";
import { roleAdmin } from "@/lib/function";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const dictionaries = {
    en: () => import('../../locales/en/lang.json').then((module) => module.default),
    zh: () => import('../../locales/zh/lang.json').then((module) => module.default),
};
interface footerTotal {
    totalBonus: number
    totalAllow: number
    totalAdvance: number
    totalShort: number
    totalOT: number
    totalTransport: number
    totalM: number
    totalSal: number
}
export const SalaryTable2 = () => {
    const session = useSession();
    const [month, selectMonth] = useState(DateTime.now().toFormat('MM'));
    const [year, setYear] = useState(DateTime.now().toFormat('yyyy'));
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idSalary, setIdSalary] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [dict, setDict] = useState<any>(null);
    const [filteredSalaries, setFilteredSalaries] = useState<SalaryUser[]>([]);
    const [editData, setEditData] = useState<SalaryUser>()
    const [activePopup, setActivePopup] = useState<typeComponentSalary | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [printLoading, setLoadingPrint] = useState<boolean>(false)
    const [salary, setSalary] = useState("");
    const [erroradd, setErrorAdd] = useState("");
    const [totalFooter, setTotalFooter] = useState<footerTotal>()
    const { data: swrData, error: swrError, isLoading: swrIsLoading, mutate } = useSWR<SalaryUser[], any>( // Explicitly type SWR's data and error
        `/api/salary/dashboardv2?role=${session.data?.user.role}&month=${month}&year=${year}`,
        fetcher,
    );
    console.log("🚀 ~ SalaryTable2 ~ swrData:", swrData)
    const {
        salaries,
        loading,
        localSearchQuery,      // For the input field (immediate updates)
        searchQuery,
        error,
        selectedTeam,
        setSalaries,
        updateSalary,
        setLocalSearchQuery,
        setLoading,
        setError,
        setSelectedTeam,
        getFilteredSalaries,
        getSortedAndFilteredSalaries,
        setSortField,
        sortConfig
    } = useSalaryStore();
    useEffect(() => {
        const currentDate = DateTime.now();
        let targetMonth, targetYear;

        // If current date is before 6th of the month, use previous month
        if (currentDate.day < 6) {
            const previousMonth = currentDate.minus({ months: 1 });
            targetMonth = previousMonth.toFormat('MM');
            targetYear = previousMonth.toFormat('yyyy');
        } else {
            targetMonth = currentDate.toFormat('MM');
            targetYear = currentDate.toFormat('yyyy');
        }

        selectMonth(targetMonth);
        setYear(targetYear);
    }, [])
    useEffect(() => {

        if (swrError) {
            console.error("SWR Error:", swrError);
            setError(swrError.message || "Failed to fetch salaries");
        } else if (!swrIsLoading && swrData) {
            setSalaries(swrData);
        } else if (swrIsLoading) {
            setLoading(true);
        }
        footerCal()
    }, [swrData]);
    useEffect(() => {
        const locale = getLocale(); // Get the valid locale
        dictionaries[locale]().then((languageDict) => {
            setDict(languageDict); // Set the dictionary in the state
        });
        getTeam()
    }, []);
    const getTeam = async () => {
        try {
            let team = await roleAdmin(session.data?.user.role)
            setSelectedTeam(team)
        } catch (error) {
            console.log("🚀 ~ getTeam ~ error:", error)

        }
    }
    const selectTeams = async (value: string) => {
        try {
            setSelectedTeam(value);

            setSelectedTeam(value);
            // getFilteredSalaries()
            footerCal()
        } catch (error) {
            console.error("Error filtering teams:", error);
        }
    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
    };

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTeam(e.target.value);
    };
    const handleOpenForm = (type: typeComponentSalary, value: SalaryUser) => {
        setEditData(value);
        setActivePopup(type);
        setIsFormOpen(true);
    }
    const handleAddComponentSalary = async (
        item: string,
        id: string,
        type: typeComponentSalary,
    ) => {

        console.log("🚀 ~ type:", type)
        switch (type) {
            case typeComponentSalary.Bonus:
                AddBonus(id, Number(item)).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()

                        toast.success("Success add Bonus ", {
                            position: "top-center",
                        });
                        handleCloseForm(); // Close the form after adding
                        return;
                    }
                });
                break;
            case typeComponentSalary.Allowance:
                AddAllow(id, Number(item)).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success add Allowance", {
                            position: "top-center",
                        });
                        handleCloseForm(); // Close the form after adding
                        return;
                    }
                });
                break;
            case typeComponentSalary.Advance:
                AddAdvance(id, Number(item)).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success add Advance", {
                            position: "top-center",
                        });
                        handleCloseForm(); // Close the form after adding
                        return;
                    }
                });
                break;
            case typeComponentSalary.Short:
                let data = await AddShort(id, Number(item))
                if (data.error) {
                    console.error(data.error);
                    toast.error(data.error, {
                        position: "top-center",
                    });
                    return;
                }
                if (data.success) {
                    mutate()
                    toast.success("Success add Short", {
                        position: "top-center",
                    });
                    handleCloseForm(); // Close the form after adding
                    return;
                }
                break;
            case typeComponentSalary.OverTime:
                let dat2 = await AddOverTime(id, Number(item))
                if (dat2.error) {
                    console.error(dat2.error);
                    toast.error(dat2.error, {
                        position: "top-center",
                    });
                    return;
                }
                if (dat2.success) {
                    mutate()
                    toast.success("Success add Overtime", {
                        position: "top-center",
                    });
                    handleCloseForm(); // Close the form after adding
                    return;
                }
                break;
            case typeComponentSalary.Transport:
                AddTransport(id, Number(item)).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success add Transport", {
                            position: "top-center",
                        });
                        handleCloseForm(); // Close the form after adding
                        return;
                    }
                });
                break;
            case typeComponentSalary.M:
                AddM(id, Number(item)).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success add M", {
                            position: "top-center",
                        });
                        handleCloseForm(); // Close the form after adding
                        return;
                    }
                });
                break;
            default:
                break;
        }
    }
    const handleRemoveComponentSalary = async (
        id: string,
        type: typeComponentSalary,
    ) => {
        const isConfirmed = window.confirm(
            dict.salary.removestatus,
        );

        // If the user cancels the action, exit the function
        if (!isConfirmed) {
            return;
        }
        switch (type) {
            case typeComponentSalary.Bonus:
                delBonus(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove Bonus", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            case typeComponentSalary.Allowance:
                delAllow(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove Allowance", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            case typeComponentSalary.Advance:
                delAdvance(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove Advance", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            case typeComponentSalary.Short:
                delShort(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove Short", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            case typeComponentSalary.OverTime:
                delOvetime(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove Overtime", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            case typeComponentSalary.Transport:
                delTransport(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove Transport", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            case typeComponentSalary.M:
                delM(id).then(async (data) => {
                    if (data.error) {
                        console.error(data.error);
                        toast.error(data.error, {
                            position: "top-center",
                        });
                        return;
                    }
                    if (data.success) {
                        mutate()
                        toast.success("Success remove M", {
                            position: "top-center",
                        });
                        return;
                    }
                });
                break;
            default:
                break;
        }
    };
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setActivePopup(null);
    };

    // Function to handle printing of selected entries
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
                totals = totals + e.fine2!
            })
            data.dataAbsent.map((e) => {
                let dd = e.dates.getDate();
                d.push(dd)
            })
            let newtotal = totals + (data.dataAbsent.length * 100);
            const lateNumbers: string = `No clock in or out * ${d.join(', ')} RM${newtotal}`;
            return lateNumbers
        } else if (type == "Absent") {
            data.dataAbsent.map((e) => {
                let dd = e.dates.getDate();
                d.push(dd)
            })
            // totals = data.dataAbsent.length * 100;
            const lateNumbers: string = `Absent * `;
            return lateNumbers
        }
        return "1212"
    }
    const parseTimeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
        const timeInMinutes = parseTimeToMinutes(time);
        const startInMinutes = parseTimeToMinutes(startTime);
        const endInMinutes = parseTimeToMinutes(endTime);
        return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    };
    const checkShift = (clockIn: string) => {
        if (clockIn) {
            if (isTimeInRange(clockIn, '07:00', '10:00')) {
                return '早班';
            }

            // Mid shift (中班): 11 AM - 17:00 (5 PM)
            if (isTimeInRange(clockIn, '11:00', '17:00')) {
                return '中班';
            }

            // Night shift (晚班): 7 PM - 10 PM
            if (isTimeInRange(clockIn, '19:00', '22:00')) {
                return '晚班';
            }
        }

        return '';
    }
    const handlePrint = async () => {
        try {
            setLoadingPrint(true)
            let printData = await excelData(Number(month), Number(year), selectedTeam);
            console.log("🚀 ~ handlePrint ~ printData:", printData)
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

            printData.forEach((item, index) => {
                const { salary, result } = item;
                const AbsentLength = result.dataAbsent.length;

                const startRowIndex = worksheet.rowCount;
                const shift = checkShift(salary.users?.AttendBranch?.clockIn!);
                // Add employee section
                addFormattedRows([`${salary.year} - ${salary.month}`, `${shift}`], { bold: true });

                // Apply bottom border only to the cell containing `${shift}`
                const yearMonthRowIndex = worksheet.rowCount; // Index of the last added row
                const shiftCell = worksheet.getRow(yearMonthRowIndex).getCell(2); // Assuming `${shift}` is in the second cell
                shiftCell.border = {
                    bottom: { style: 'thin' }, // Apply thin bottom border
                };

                // Main headers
                addFormattedRows([
                    `${salary.users?.AttendBranch?.branch}`, "Day", "", "Basic", "Bonus", "Allow", "",
                    "Advance", "Short", "Cover", "", "", "Total",
                ], { bold: true });

                // Sub-headers
                addFormattedRows([
                    salary.users?.name, "底薪", "日", "实薪", "奖金", "津贴", "迟到\n扣款",
                    "借粮", "少/多", "加班\n晚班", "交通\n补贴", "M", "total",
                ], { bold: false });

                // Numeric data row
                const totalSalary = salary.perDay! * salary.workingDay!;
                const totalBonus = salary.bonus || 0;
                const totalAllowance = salary.allowance || 0;
                const totalFine = -(salary.fineLate! + salary.fineNoClockIn! + salary.fineNoClockOut! + salary.absent!) || 0;
                const totalAdvances = salary.advances || 0;
                const totalShort = salary.short || 0;
                const totalOvertime = salary.overTime || 0;
                const totalTransport = salary.transport || 0;
                const totalM = salary.m || 0;
                const total = totalSalary + totalBonus + totalAllowance + totalFine + totalOvertime;  // Calculate the sum here

                addFormattedRows([
                    "", // Empty cell for merged name
                    salary.perDay || 0,
                    salary.workingDay || 0,
                    totalSalary,
                    totalBonus,
                    totalAllowance,
                    totalFine,
                    totalAdvances,
                    totalShort,
                    totalOvertime,
                    totalTransport,
                    totalM,
                    total || 0,

                ], { alignment: { horizontal: 'center', vertical: 'middle', } });


                // Absences and fines details
                // addFormattedRows([getDate(result, "Absent", salary.perDay!)], { alignment: { horizontal: 'left' } });
                // addFormattedRows([getDate(result, "Late", 0)], { alignment: { horizontal: 'left' } });
                // addFormattedRows([getDate(result, "NoInOut", 0)], { alignment: { horizontal: 'left' } });
                addFormattedRows([
                    `${getDate(result, "Absent", salary.perDay!)} \n${getDate(result, "Late", 0)} \n${getDate(result, "NoInOut", 0)}`
                ], {
                    alignment: {
                        horizontal: 'left', wrapText: true, vertical: 'middle'
                    }
                });

                // Merge header cells for grouped columns
                worksheet.mergeCells(`A${startRowIndex + 3}`, `A${startRowIndex + 4}`);
                worksheet.mergeCells(`M${startRowIndex + 3}`, `M${startRowIndex + 4}`);
                worksheet.mergeCells(`B${startRowIndex + 2}`, `C${startRowIndex + 2}`); // Merge "Day"
                worksheet.mergeCells(`F${startRowIndex + 2}`, `G${startRowIndex + 2}`); // Merge "Allow"
                worksheet.mergeCells(`J${startRowIndex + 2}`, `L${startRowIndex + 2}`); // Merge "Cover"
                worksheet.mergeCells(`A${startRowIndex + 5}`, `M${startRowIndex + 5}`);
                // worksheet.mergeCells(`A${startRowIndex + 6}`, `M${startRowIndex + 6}`);
                worksheet.getCell(`M${startRowIndex + 4}`).value = {
                    formula: `=SUM(D${startRowIndex + 4}:L${startRowIndex + 4})`
                };

                worksheet.getCell(`D${startRowIndex + 4}`).value = {
                    formula: `=B${startRowIndex + 4} * C${startRowIndex + 4}`  // `B2` 和 `C2` 的乘积，存放在 `D2`
                };
                const totalCell = worksheet.getCell(`M${startRowIndex + 4}`);
                const advance = worksheet.getCell(`H${startRowIndex + 4}`);
                const short = worksheet.getCell(`I${startRowIndex + 4}`);
                if (total < 0) {
                    totalCell.font = {
                        color: { argb: 'FFFF0000' } // Red for negative values
                    };

                }
                if (salary.advances! < 0) {
                    advance.font = {
                        color: { argb: 'FFFF0000' }
                    }

                }
                if (salary.short! < 0) {
                    short.font = {
                        color: { argb: 'FFFF0000' }
                    }
                }

                worksheet.getCell(`A${startRowIndex + 5}`).border = {
                    top: { style: 'thin' },
                }
                worksheet.getCell(`A${startRowIndex + 1}`).border = {
                    bottom: { style: 'thin' },
                }
                worksheet.getCell(`H${startRowIndex + 4}`).border = {
                    bottom: { style: 'thin' },
                }
                worksheet.getCell(`K${startRowIndex + 4}`).border = {
                    bottom: { style: 'thin' },
                }
                worksheet.getCell(`I${startRowIndex + 4}`).border = {
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                }
                worksheet.getCell(`L${startRowIndex + 4}`).border = {
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                }
                worksheet.getCell(`A${startRowIndex + 5}`).border = {

                }
                // worksheet.getCell(`A${startRowIndex + 6}`).border = {

                // }
                // worksheet.getCell(`A${startRowIndex + 7}`).border = {

                // }
                worksheet.getCell(`A${startRowIndex + 5}`).font = {
                    color: { argb: 'FFFF0000' },
                }
                worksheet.getCell(`G${startRowIndex + 4}`).font = {
                    color: { argb: 'FFFF0000' },
                };
                // Set row height for specific rows
                worksheet.getRow(startRowIndex + 1).height = 53.25; // Header row height
                worksheet.getRow(startRowIndex + 2).height = 53.25; // Sub-header row height
                worksheet.getRow(startRowIndex + 3).height = 53.25; // Data row height

                // Additional row heights as needed
                worksheet.getRow(startRowIndex + 4).height = 53.25;
                worksheet.getRow(startRowIndex + 5).height = 53.25;
                // worksheet.getRow(startRowIndex + 6).height = 53.25;
                // worksheet.getRow(startRowIndex + 7).height = 53;
            });
            worksheet.properties.defaultRowHeight = 35;

            worksheet.getColumn("B").width = 6.57
            worksheet.getColumn("C").width = 5.14
            worksheet.getColumn("D").width = 7
            worksheet.getColumn("E").width = 7.14
            worksheet.getColumn("F").width = 7
            worksheet.getColumn("G").width = 7.57
            worksheet.getColumn("H").width = 9.14
            worksheet.getColumn("I").width = 5.43
            worksheet.getColumn("J").width = 6.43
            worksheet.getColumn("K").width = 6
            worksheet.getColumn("L").width = 5.71
            worksheet.getColumn("M").width = 8.71


            // Save workbook
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const safeTeam = selectedTeam?.replace(/\s+/g, '_') || 'All';
            link.download = `${year}-${month}_Team${safeTeam}_Payslip.xlsx`;
            // link.download = 'PayslipReport.xlsx';
            link.click();
            setLoadingPrint(false)
        } catch (error) {
            setLoadingPrint(false)
        }
    }
    const handleConfirmOpen = (id: string) => {
        setIdSalary(id);
        setIsConfirmOpen(true);
    };
    const handleConfirmClose = () => {
        setIsConfirmOpen(false);
        setError("");
        // Reset current action if needed
    };
    const handleConfirm = async () => {
        console.log("salary handle confirm", salary);
        if (!salary || Number(salary) === 0) {
            setError("Cannot confirm with an empty or zero value.");
            return;
        }
        setError("");
        let result = await addPerDay(idSalary, Number(salary));
        if (result.error) {
            setError(result.error);
            return;
        }
        if (result.success) {

            mutate();
            handleConfirmClose();
            // window.location.reload();
        }
    };
    const footerCal = () => {
        try {
            const bonus = getFilteredSalaries().reduce((sum, sal) => sum + (sal.bonus || 0), 0);
            const Allow = getFilteredSalaries().reduce((sum, sal) => sum + (sal.allowance || 0), 0);
            const Advance = getFilteredSalaries().reduce((sum, sal) => sum + (sal.advances || 0), 0);
            const Short = getFilteredSalaries().reduce((sum, sal) => sum + (sal.short || 0), 0);
            const OT = getFilteredSalaries().reduce((sum, sal) => sum + (sal.overTime || 0), 0);
            const Transport = getFilteredSalaries().reduce((sum, sal) => sum + (sal.transport || 0), 0);
            const M = getFilteredSalaries().reduce((sum, sal) => sum + (sal.m || 0), 0);
            const totals = getFilteredSalaries().reduce((sum, sal) => sum + (sal.total || 0), 0);
            setTotalFooter({
                totalAdvance: Advance,
                totalAllow: Allow,
                totalBonus: bonus,
                totalShort: Short,
                totalOT: OT,
                totalTransport: Transport,
                totalM: M,
                totalSal: totals
            })
        } catch (error) {
            console.log("🚀 ~ footerCal ~ error:", error)

        }
    }
    if (swrIsLoading || !dict) { // Show SWR loading only on initial load or if reducer hasn't been populated
        return <Loader2 />;
    }

    if (swrError) { // Show SWR error if reducer has no data
        return <div className="p-4 text-center text-red-500">Error loading data: {swrError.message || "Unknown error"}</div>;
    }
    return (
        <><div
            className="h-[1280px] w-[1920px] overflow-auto rounded-[10px] bg-white p-4 
             px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:h-auto md:w-full md:p-6 2xl:p-10"
        >


            <div className="mb-5 flex justify-between">
                <div className="relative mb-5">
                    {/* Year selection dropdown */}
                    <select
                        id="year"
                        className="rounded bg-white p-2 pr-5 text-[24px] font-bold text-dark dark:bg-gray-dark dark:text-white"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {/* Add year options */}
                        <option value={new Date().getFullYear() - 1}>
                            {new Date().getFullYear() - 1}
                        </option>
                        <option value={new Date().getFullYear()}>
                            {new Date().getFullYear()}
                        </option>
                    </select>

                    {/* Month selection dropdown with Check button beside it */}
                    <select
                        id="month"
                        className="ml-5 mr-5 rounded bg-white p-2 text-[24px] font-bold uppercase text-dark dark:border-gray-600 dark:bg-gray-dark dark:text-white"
                        // defaultValue={String(new Date().getMonth() + 1).padStart(2, '0')}  // Set default to current month
                        value={month}
                        onChange={(e) => selectMonth(e.target.value)}
                    >
                        {/* Add month options */}
                        <option value="01">Jan</option>
                        <option value="02">Feb</option>
                        <option value="03">Mar</option>
                        <option value="04">Apr</option>
                        <option value="05">May</option>
                        <option value="06">Jun</option>
                        <option value="07">Jul</option>
                        <option value="08">Aug</option>
                        <option value="09">Sep</option>
                        <option value="10">Oct</option>
                        <option value="11">Nov</option>
                        <option value="12">Dec</option>
                    </select>

                    {/* Check button beside the month dropdown */}
                    {/* <button className="ml-5 rounded bg-blue-500 px-4 py-2 pl-5 pr-5 font-bold text-white hover:bg-blue-600">
              {dict.salary.check}
            </button> */}
                    {session.data?.user.role == 'ADMIN' ? (
                        <>
                            <select
                                id="month"
                                className="ml-5 mr-5 rounded bg-white p-2 text-[24px] font-bold uppercase text-dark dark:border-gray-600 dark:bg-gray-dark dark:text-white"
                                // defaultValue={String(new Date().getMonth() + 1).padStart(2, '0')}  // Set default to current month
                                value={selectedTeam}
                                onChange={(e) => selectTeams(e.target.value)}
                            >
                                {/* Add month options */}
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="SW">SW</option>
                                <option value="Ocean">Ocean</option>
                            </select>
                        </>
                    ) : (<></>)}

                </div>

                <div className="relative mb-5 w-full max-w-[414px]">
                    <input
                        className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                        placeholder={dict.dashboard.search}
                        type="text"
                        value={localSearchQuery}  // Use localSearchQuery for immediate updates
                        onChange={handleSearchChange}
                    />
                    <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white">
                        <svg
                            className="fill-current"
                            width={18}
                            height={18}
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8.25 3C5.3505 3 3 5.3505 3 8.25C3 11.1495 5.3505 13.5 8.25 13.5C11.1495 13.5 13.5 11.1495 13.5 8.25C13.5 5.3505 11.1495 3 8.25 3ZM1.5 8.25C1.5 4.52208 4.52208 1.5 8.25 1.5C11.9779 1.5 15 4.52208 15 8.25C15 11.9779 11.9779 15 8.25 15C4.52208 15 1.5 11.9779 1.5 8.25Z"
                                fill=""
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M11.958 11.957C12.2508 11.6641 12.7257 11.6641 13.0186 11.957L16.2811 15.2195C16.574 15.5124 16.574 15.9872 16.2811 16.2801C15.9882 16.573 15.5133 16.573 15.2205 16.2801L11.958 13.0176C11.6651 12.7247 11.6651 12.2499 11.958 11.957Z"
                                fill=""
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <main className="w-full min-w-[1280px]">
                <div className="w-full min-w-[1280px] p-4 md:p-6 2xl:p-10 grid grid-cols-[repeat(16,minmax(100px,1fr))]">
                    {/* <div className=""> */}
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Username')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.username}
                        </h5>
                        {sortConfig.field === "Username" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Branches')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.branches.branches}

                        </h5>
                        {sortConfig.field === "Branches" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div
                        className="col-span-1 flex items-center justify-center"
                    // onClick={() => setSortField('BasicSalary')}
                    >
                        <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.basic}
                        </h5>
                        {/* {sortConfig.field === "BasicSalary" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )} */}
                    </div>

                    <div
                        className="col-span-1 flex items-center justify-center"
                    // onClick={() => handleSort("ot")}
                    >
                        <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.ot}
                        </h5>
                        {/* {sortColumn === "ot" && (
                            <span
                                className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortOrder === "asc" ? "▲" : "▼"}
                            </span>
                        )} */}
                    </div>
                    <div
                        className="col-span-1 flex items-center justify-center"
                    // onClick={() => setSortField('TotalWorkingdays')}
                    >
                        <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.totalworkingday}
                        </h5>
                        {/* {sortConfig.field === "TotalWorkingdays" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )} */}
                    </div>
                    <div
                        className="col-span-1 flex items-center justify-center"
                    // onClick={() => handleSort("late")}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">{dict.salary.fine}</h5>
                        {/* {sortColumn === "late" && (
                            <span
                                className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortOrder === "asc" ? "▲" : "▼"}
                            </span>
                        )} */}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Bonus')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">{dict.salary.enterbonus}</h5>
                        {sortConfig.field === 'Bonus' && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Allow')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.enterallow}
                        </h5>
                        {sortConfig.field === "Allow" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Advance')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.enteradvance}
                        </h5>
                        {sortConfig.field === "Advance" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Short')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.entershort}
                        </h5>
                        {sortConfig.field === "Short" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('OT')}
                    >
                        <h5 className="text-sm font-medium uppercase xsm:text-base">{dict.salary.enterot}</h5>
                        {sortConfig.field === "OT" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('Transport')}>
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.entertransport}
                        </h5>
                        {sortConfig.field === "Transport" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('M')}>
                        <h5 className="text-sm font-medium uppercase xsm:text-base">{dict.salary.enterm}</h5>
                        {sortConfig.field === "M" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div
                        className="col-span-1 flex cursor-pointer items-center justify-center"
                        onClick={() => setSortField('TotalSalary')}
                    >
                        <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.totalsalary}
                        </h5>
                        {sortConfig.field === "TotalSalary" && (
                            <span
                                className={`ml-2 ${sortConfig.order === "asc" ? "text-primary" : "text-secondary"}`}
                            >
                                {sortConfig.order === "asc" ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                    <div className="col-span-1 flex flex-col items-center justify-center">
                        <LoadingButton name={dict.salary.print} click={handlePrint} isloading={printLoading} />
                        {/* <label className="mt-2 flex items-center">
                            <input
                                type="checkbox"
                                // checked={selectAll} // Bind checkbox to selectAll state
                                // onChange={handleSelectAllChange} // Handle change
                                className="mr-2"
                            />
                            <span className="text-sm">{dict.salary.selectall}</span>
                        </label> */}
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            {dict.salary.actions}
                        </h5>
                    </div>
                    {/* </div> */}
                </div>
            </main >
            <div className="h-[860px] overflow-x-auto">
                {getSortedAndFilteredSalaries().map((salary, key) => (
                    <div
                        className={`grid grid-cols-[repeat(16,minmax(100px,1fr))] border-t border-stroke px-4 py-4.5 dark:border-dark-3 md:px-6 2xl:px-7.5 "border-b border-stroke dark:border-dark-3"
                            }`}
                        key={key}
                    >
                        <div className="flex items-center gap-3.5">
                            <div
                                className="h-15 w-15 rounded-md"
                                style={{ position: "relative", paddingBottom: "20%" }}
                                onClick={() =>
                                    setSelectedImage(
                                        salary.users?.userImg
                                            ? `http://image.ocean00.com${salary.users?.userImg}`
                                            : "/uploads/user/defaultUser.jpg",
                                    )
                                }
                            >
                                <Image
                                    src={
                                        salary.users?.userImg
                                            ? `http://image.ocean00.com${salary.users?.userImg}`
                                            : "/uploads/user/defaultUser.jpg"
                                    }
                                    width={50}
                                    height={50}
                                    alt="leave"
                                />
                            </div>
                            <div className="flex flex-col">
                                <p className="flex font-medium text-dark dark:text-white sm:block">
                                    {salary.users?.name}
                                </p>
                                <p className="flex text-sm text-gray-500 sm:block">
                                    {salary.users?.username}
                                </p>
                            </div>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                                {salary.users?.AttendBranch?.team} ({salary.users?.AttendBranch?.branch})
                            </p>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                                {salary.perDay}
                            </p>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                                {Math.round(salary.overTimeHour! / 60)}
                            </p>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                                {salary.workingDay}
                            </p>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <p className="text-body-sm font-medium text-red-500 dark:text-red-300">
                                {salary.fineLate! + salary.fineNoClockIn!}
                            </p>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}
                            <button
                                // disabled={isDisabled}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.Bonus, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>

                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {salary.bonus && (
                                    <>
                                        <ComponentSalary
                                            amount={salary.bonus}
                                            type={typeComponentSalary.Bonus}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}
                            <button
                                // disabled={isDisabled}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.Allowance, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>
                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {salary.allowance !== null && salary.allowance !== undefined && (
                                    <>
                                        {" "}
                                        <ComponentSalary
                                            amount={salary.allowance.toString()}
                                            type={typeComponentSalary.Allowance}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />{" "}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}
                            <button
                                // disabled={isDisabled}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.Advance, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>
                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {salary.advances && (
                                    <>
                                        {" "}
                                        <ComponentSalary
                                            amount={salary.advances.toString()}
                                            type={typeComponentSalary.Advance}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />{" "}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}
                            <button
                                // disabled={salary.short != null ? true:false}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.Short, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>

                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {/* <MultiSelect
                  items={selectedItems}
                  onRemove={handleRemoveOverTime}
                  id={id}
                /> */}
                                {salary.short && (
                                    <>
                                        {" "}
                                        <ComponentSalary
                                            amount={salary.short}
                                            type={typeComponentSalary.Short}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />{" "}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}
                            <button
                                // disabled={isDisabled}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.OverTime, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>

                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {/* <MultiSelect
                  items={selectedItems}
                  onRemove={handleRemoveOverTime}
                  id={id}
                /> */}
                                {salary.overTime && (
                                    <>
                                        {" "}
                                        <ComponentSalary
                                            amount={salary.overTime}
                                            type={typeComponentSalary.OverTime}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />{" "}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}

                            <button
                                // disabled={isDisabled}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.Transport, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>

                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {salary.transport && (
                                    <>
                                        <ComponentSalary
                                            amount={salary.transport}
                                            type={typeComponentSalary.Transport}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            {/* ButtonPopup component */}
                            <button
                                // disabled={isDisabled}
                                className="mb-4 rounded-full border border-primary px-4 text-primary sm:px-6 md:px-8 lg:px-10 xl:px-5"
                                onClick={() => handleOpenForm(typeComponentSalary.M, salary)}
                            >
                                {dict.salary.add}{" "}
                            </button>

                            {/* MultiSelect component */}
                            <div className="items-center justify-center px-5">
                                {salary.m && (
                                    <>
                                        {" "}
                                        <ComponentSalary
                                            amount={salary.m}
                                            type={typeComponentSalary.M}
                                            id={`${salary.id}`}
                                            handleRemove={handleRemoveComponentSalary}
                                        />{" "}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                                {salary.total}
                            </p>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            {/* <label className="flex items-center">
                                <input
                                    type="checkbox"

                                    className="mr-2"
                                />
                            </label> */}
                        </div>

                        <div className="col-span-1 flex items-center justify-center space-x-3.5">
                            <button
                                onClick={() => handleConfirmOpen(salary.id)}
                                className="hover:text-primary"
                            >
                                <svg
                                    className="fill-current"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                                </svg>
                            </button>
                            {/* <Link
                href={`/invoice/${salary.id}`} // Update to your desired route
                className="flex items-center justify-center hover:text-primary"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
                </svg>
              </Link> */}
                        </div>
                    </div>
                ))} </div>

            {/* Pagination */}
            <div className="grid grid-cols-[repeat(16,minmax(100px,1fr))] gap-2 px-7.5 py-7">
                {/* Prev/Next 按钮区域（占 2 栏） */}
                <div className="col-span-2 flex items-center space-x-2">
                    <button className="rounded-[3px] p-[7px] px-[12px] hover:bg-primary hover:text-white">
                        {dict.dashboard.prev}
                    </button>
                    <button className="rounded-[3px] p-[7px] px-[12px] hover:bg-primary hover:text-white">
                        {dict.dashboard.next}
                    </button>
                </div>

                {/* 空格占位（比如 4 栏空白） */}
                <div className="col-span-4"></div>

                {/* 下面是你重复的 Total Bonus（每项占 1 栏） */}
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalBonus}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalAllow}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalAdvance}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalShort}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalOT}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalTransport}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalM}
                </div>
                <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-blue-600">
                    RM {totalFooter?.totalSal}
                </div>

                {/* 最后剩下两格做空白（或你想放别的东西） */}
                <div className="col-span-2"></div>
            </div>

            {/* Render the image modal */}
            <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
                <Image
                    src={selectedImage || ""}
                    width={500}
                    height={500}
                    alt="Product"
                />
            </Modal>

            {/* Combined Popups */}
            {isFormOpen && (
                <>
                    {activePopup === typeComponentSalary.Bonus && (
                        <BonusPopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.Bonus}
                        />
                    )}
                    {activePopup === typeComponentSalary.Allowance && (
                        <AllowPopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.Allowance}
                        />
                    )}
                    {activePopup === typeComponentSalary.Advance && (
                        <AdvancePopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.Advance}
                        />
                    )}
                    {activePopup === typeComponentSalary.Short && (
                        <ShortPopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.Short}
                        />
                    )}
                    {activePopup === typeComponentSalary.OverTime && (
                        <OTPopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.OverTime}
                        />
                    )}
                    {activePopup === typeComponentSalary.Transport && (
                        <TransportPopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.Transport}
                        />
                    )}
                    {activePopup === typeComponentSalary.M && (
                        <MPopupv2
                            isOpen={true}
                            onClose={handleCloseForm}
                            onAddItem={handleAddComponentSalary} // Use the specific handler
                            data={editData!}
                            type={typeComponentSalary.M}
                        />
                    )}
                </>
            )}

            {/* Render the confirmation modal */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={() => {
                    handleConfirmClose();
                    setSalary(""); // Clear the salary input
                    setErrorAdd(""); // Clear any error messages
                }}
            >
                <div className="p-5">
                    <p className="mb-4 justify-center text-center">
                        {dict.salary.changesalary}
                    </p>

                    {/* Text field for entering the salary */}
                    <div className="flex justify-center">
                        <input
                            type="text"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder={dict.salary.entersalary}
                            className="mb-4 w-full max-w-xs rounded-lg border border-gray-300 p-2 focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Error message */}
                    {/* {error && <p className="text-center text-red-500">{error}</p>} */}

                    {/* Buttons positioned at the bottom right */}
                    <div className="mt-6 flex items-center justify-end space-x-4">
                        <button
                            onClick={() => {
                                handleConfirmClose();
                                setSalary(""); // Clear the salary input
                                setError(""); // Clear any error messages
                            }}
                            className="font-medium text-red-500 underline hover:text-red-600"
                        >
                            {dict.leave.cancel}
                        </button>
                        <button
                            onClick={() => {
                                handleConfirm();
                                setSalary(""); // Clear the salary input after confirming
                                setError(""); // Clear any error messages
                            }}
                            className="btn btn-primary rounded-[5px] bg-green-500 px-6 py-2 font-medium text-white hover:bg-opacity-90"
                        >
                            {dict.leave.confirm}
                        </button>
                    </div>
                </div>
            </Modal>


        </div>
        </>
    )
}