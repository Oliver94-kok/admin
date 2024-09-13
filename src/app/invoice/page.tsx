import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import LeaveTable from "@/components/Tables/LeaveTable";
import InvoiceTable from "@/components/Tables/InvoiceTable";


export const metadata: Metadata = {
    title: "Invoice Page",
};

const Invoice = () => {
    return (
        <>
            <DefaultLayout>
                <InvoiceTable />
            </DefaultLayout>
        </>
    );
}

export default Invoice;