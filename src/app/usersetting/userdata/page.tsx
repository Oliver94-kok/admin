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
import { Buffer } from 'buffer';
import { AttendStatus } from "@prisma/client";

const dictionaries = {
    en: () => import("../../../locales/en/lang.json").then((module) => module.default),
    zh: () => import("../../../locales/zh/lang.json").then((module) => module.default),
};

export interface userExcel {
    name: string | undefined;
    branch: string | null | undefined;
    attend: {
        clockIn: string | null;
        clockOut: string | null;
        dates: string;
        status: AttendStatus;
        img: string | null; // Optional property for the photo path
        leaves: { type: string; } | null;
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
        if (result != null || result != undefined) {
            console.log("Result from getDataUser:", result);
            await saveAsExcel(result)
            return setIsLoading(false)
        }
        setIsLoading(false)
        return
    };

    const fetchWithRetry = async (
        url: string,
        retries = 3,
        timeout = 10000
    ): Promise<ArrayBuffer | null> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), timeout);
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);
                return await response.arrayBuffer();
            } catch (error) {
                console.warn(
                    `Attempt ${attempt} for ${url} failed:`,
                    (error as Error).message
                );
                if (attempt < retries) {
                    // 等待一段时间后重试
                    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
                } else {
                    console.error(`All ${retries} attempts failed for ${url}`);
                    return null;
                }
            }
        }
        return null;
    };


    const saveAsExcel = async (data: userExcel[]) => {
        if (!data.length) return;

        // data.sort((a, b) => {
        //     // Ensure branch is not null or undefined
        //     if (!a.branch || !b.branch) {
        //         return 0; // You can modify this based on how you want to handle null/undefined values
        //     }

        //     const letterA = a.branch[0]; // Extract the letter part (e.g., "B")
        //     const letterB = b.branch[0]; // Extract the letter part (e.g., "B")

        //     const numberA = parseInt(a.branch.slice(1), 10); // Extract the number part (e.g., "80")
        //     const numberB = parseInt(b.branch.slice(1), 10); // Extract the number part (e.g., "230")

        //     if (letterA !== letterB) {
        //         return letterA.localeCompare(letterB); // Sort by letter first
        //     } else {
        //         return numberA - numberB; // Then sort by the number part as an integer
        //     }
        // });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('UserData');

        const addFormattedRows = (rowData: any[], options: { bold?: boolean, alignment?: Partial<ExcelJS.Alignment>, noBorder?: boolean } = {}) => {
            const row = worksheet.addRow(rowData);
            row.eachCell((cell) => {
                if (!options.noBorder) {
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                } else {
                    cell.border = {};
                }
                if (options.bold) cell.font = { bold: true };
                cell.alignment = options.alignment || { vertical: 'middle', horizontal: 'center', wrapText: true };
            });
            return row;
        };

        const imageCache = new Map<string, ArrayBuffer>();

        const addImageFromUrl = async (
            url: string,
            rowIndex: number,
            colIndex: number
        ) => {
            try {
                let arrayBuffer;
                if (imageCache.has(url)) {
                    arrayBuffer = imageCache.get(url)!;
                } else {
                    arrayBuffer = await fetchWithRetry(url, 3, 10000);
                    if (!arrayBuffer) {
                        console.warn(`Skipping image due to repeated failures: ${url}`);
                        return;
                    }
                    imageCache.set(url, arrayBuffer);
                }

                const imageId = workbook.addImage({
                    buffer: arrayBuffer,
                    extension: "jpeg",
                });
                worksheet.addImage(imageId, {
                    tl: { col: colIndex - 1, row: rowIndex - 2 },
                    ext: { width: 50, height: 50 },
                });
            } catch (error) {
                // console.error(`Failed to fetch image from ${url}:`, error);
            }
        };

        let currentRow = 1;
        const imagePromises: Promise<void>[] = [];
        console.log("print excel 1 ")
        for (const item of data) {
            const { name, branch, attend } = item;

            addFormattedRows([`${branch}`, `${name}`], { bold: true });
            currentRow++;
            console.log("print excel 2")
            for (const a of attend) {
                let ins = a.clockIn == null ? "No clock" : a.clockIn
                let out = a.clockOut == null ? "No clock" : a.clockOut
                if (a.status == "Leave") {
                    addFormattedRows([`${a.dates}`, "in", `${a.leaves?.type}`, "out", `${a.leaves?.type}`]);
                    worksheet.getCell(`C${currentRow}`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: '00FF00' }
                    };
                    worksheet.getCell(`E${currentRow}`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: '00FF00' }
                    };
                } else {
                    addFormattedRows([`${a.dates}`, "in", `${ins}`, "out", `${out}`]);
                    if (ins == "No clock") {
                        worksheet.getCell(`C${currentRow}`).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF00' }
                        };
                    }
                    if (out == "No clock") {
                        worksheet.getCell(`E${currentRow}`).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF00' }
                        };
                    }
                }
                console.log("row id", currentRow, a.dates)
                if (a.status == "Late" || a.status == "No_clockIn_ClockOut_Late") {
                    console.log("row id", currentRow, a.dates)

                    worksheet.getCell(`C${currentRow}`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF0000' }
                    };
                }
                currentRow++;

                if (a.img) {
                    imagePromises.push(addImageFromUrl(`https://image.ocean00.com${a.img}`, currentRow, 6));
                }
            }

            addFormattedRows(["", ""], { noBorder: true });
            currentRow++;
        }

        await Promise.all(imagePromises);

        worksheet.properties.defaultRowHeight = 40;
        worksheet.eachRow((row) => row.height = 40);
        const totalColumns = worksheet.columnCount;
        for (let i = 1; i <= totalColumns; i++) worksheet.getColumn(i).width = 12;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeTeam = `Team${team.replace(/\s+/g, '_')}`;
        link.download = `${year}-${month}_${safeTeam}_UserData.xlsx`;
        // link.download = `UserData.xlsx`;
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
                                        onChange={(e) => setMonth(e.target.value.padStart(2, '0'))}
                                    >
                                        <option value="">{dict.userdata.choosemonth}</option>
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const value = String(i + 1).padStart(2, '0'); // e.g., 01, 02, ..., 12
                                            return (
                                                <option key={value} value={value}>
                                                    {new Date(0, i).toLocaleString(getLocale(), { month: "long" })}
                                                </option>
                                            );
                                        })}
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
                                        <option value="E">E</option>
                                        <option value="SW">SW</option>
                                        <option value="Ocean">Ocean</option>
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
