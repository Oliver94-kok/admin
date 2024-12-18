"use client";
import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Modal from "@/components/modal";
export const dynamic = "force-dynamic";
import { useSession } from "next-auth/react";
import Loader from "@/components/common/Loader";
import { getDataUser } from "@/action/getUserData";
export const dynamicParams = true;
import ExcelJS from 'exceljs';

const dictionaries = {
    en: () => import("../../../locales/en/lang.json").then((module) => module.default),
    zh: () => import("../../../locales/zh/lang.json").then((module) => module.default),
};

interface userExcel {
    name: string | undefined;
    branch: string | null | undefined;
    attend: {
        clockIn: string | null;
        clockOut: string | null;
        dates: string;
    }[];
}


const FormLayout = () => {
    const session = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [team, setTeam] = useState("");
    const [dict, setDict] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const getLocale = (): "en" | "zh" => {
        const locale = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
        return locale === "en" || locale === "zh" ? locale : "en";
    };

    useEffect(() => {
        const locale = getLocale();
        dictionaries[locale]().then((languageDict) => {
            setDict(languageDict);
        });
    }, []);

    if (!dict) return <div>Loading...</div>;

    const handleExport = async () => {
        if (!year || !month || !team) {
            alert("Please select all fields before exporting.");
            return;
        }
        console.log(`Exporting data for Year: ${year}, Month: ${month}, Team: ${team}`);
        setIsLoading(true);
        let result = await getDataUser(Number(year), Number(month), team);
        if (result != null) {
            await saveAsExcel(result)
            return setIsLoading(false)
        }
        setIsLoading(false)
        return
    };
    const saveAsExcel = async (data: userExcel[]) => {
        if (!data.length) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payslips');

        const addFormattedRows = (rowData: any[], options: {
            bold?: boolean,
            alignment?: Partial<ExcelJS.Alignment>,
            noBorder?: boolean
        } = {}) => {
            const row = worksheet.addRow(rowData);

            row.eachCell((cell) => {
                // cell.border = {
                //     top: { style: 'thin' },
                //     left: { style: 'thin' },
                //     bottom: { style: 'thin' },
                //     right: { style: 'thin' }
                // };
                if (!options.noBorder) {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                } else {
                    // Remove border by setting it to undefined
                    cell.border = {

                    };
                }
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

        data.forEach((item, index) => {
            const { name, branch, attend } = item;


            const startRowIndex = worksheet.rowCount;

            // Add employee section
            addFormattedRows([`${branch}`, `${name}`], { bold: true });
            attend.map((a) => {
                addFormattedRows([
                    `${a.dates}`, "in", `${a.clockIn}`, "out", `${a.clockOut}`
                ],);

            })
            addFormattedRows(["", ""], { noBorder: true });
        });
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getColumn('A').width = 12; // You can also use the column letter


        // Save workbook
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // link.download = 'PayslipReport.xlsx';
        link.download = `report team ${team}-${month}-${year}.xlsx`;
        link.click();
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <DefaultLayout>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                        <h3 className="font-semibold text-dark dark:text-white">
                            {dict.userdata.exportform}
                        </h3>
                    </div>
                    {isLoading ? <><Loader /></> : <>
                        <form>
                            <div className="p-6.5">
                                {/* Select Year */}
                                <div className="mb-4.5">
                                    <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                                        {dict.userdata.selectyear}
                                        <span className="text-red">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <option value="">{dict.userdata.chooseyear}</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                    </select>
                                </div>

                                {/* Select Month */}
                                <div className="mb-4.5">
                                    <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                                        {dict.userdata.selectmonth}
                                        <span className="text-red">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                    >
                                        <option value="">{dict.userdata.choosemonth}</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString(getLocale(), { month: "long" })}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select Team */}
                                <div className="mb-4.5">
                                    <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                                        {dict.userdata.selectteam}
                                        <span className="text-red">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                                        value={team}
                                        onChange={(e) => setTeam(e.target.value)}
                                    >
                                        <option value="">{dict.userdata.chooseteam}</option>
                                        <option value="All">All Team</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>

                                {/* Export Button */}
                                <button
                                    type="button"
                                    className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                                    onClick={handleExport}
                                >
                                    {dict.userdata.export}
                                </button>
                            </div>
                        </form></>}
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} username={year} password={month} />
        </DefaultLayout>
    );
};

export default FormLayout;
