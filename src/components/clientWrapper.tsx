"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import OneSignal from "react-onesignal";

import { ToastContainer } from "react-toastify";
import { SessionProvider } from 'next-auth/react';

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // initializeOneSignal()
        }
    }, []);

    const initializeOneSignal = async () => {
        OneSignal.init({
            appId: '48db9e0a-c176-4c30-ba58-44630340624f',
            notifyButton: {
                enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
        }).then(async () => {
            await OneSignal.Slidedown.promptPush();
            await OneSignal.Notifications.requestPermission();
            OneSignal.User.addTag('role', 'admin')
        });
    };

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    return (

        <>
            {loading ? <Loader /> : children}
            <ToastContainer />
        </>

    );
}