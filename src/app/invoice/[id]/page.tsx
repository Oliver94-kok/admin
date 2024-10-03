import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import LeaveTable from "@/components/Tables/LeaveTable";
import InvoiceTable from "@/components/Tables/InvoiceTable";
import { db } from "@/lib/db";
import { SalaryUser, userInvoice } from "@/types/salary";


export const metadata: Metadata = {
    title: "Invoice Page",
};

const getData = async (id: string) => {
    let data = await db.salary.findFirst({ where: { id, }, include: { users: { select: { name: true, username: true, } } } })
    return data;
}

const Invoice = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const invoice: userInvoice | null = await getData(id)
    console.log("🚀 ~ Invoice ~ invoice:", invoice)
    return (
        <>
            <DefaultLayout>
                <InvoiceTable data={invoice} />
            </DefaultLayout>
        </>
    );
}

export default Invoice;