export const dynamic = 'force-dynamic'
import { getData } from "@/action/invoice";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Payslip2 } from "@/components/printPayslip2";
import MultiInvoiceTable from "@/components/Tables/MultiInvoiceTable";
import { SalaryRecord } from "@/types/salary2";
import axios from "axios";

const InvoiceAll = async () => {
    const cookieData: SalaryRecord[] = await getData();


    return (
        <>
            <DefaultLayout>
                <MultiInvoiceTable datas={cookieData} />
                {/* <Payslip2 data={cookieData} /> */}
            </DefaultLayout>

        </>
    )
}



export default InvoiceAll;