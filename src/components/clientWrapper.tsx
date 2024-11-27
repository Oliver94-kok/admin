"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import OneSignal from "react-onesignal";

import { ToastContainer } from "react-toastify";
import { SessionProvider, useSession } from 'next-auth/react';
import { useNotificationStore } from "@/lib/zudstand/notify";

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const session = useSession();
    const { addNotification, initializeFromDatabase } = useNotificationStore()
    useEffect(() => {
        initializeFromDatabase(session.data?.user.id)
        if (typeof window !== 'undefined') {
            initializeOneSignal()
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
            OneSignal.User.addTag('role', session.data?.user.role)

        });
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
            console.log("Foreground Notification Event:", event)
            console.group('🔔 OneSignal Foreground Notification')
            console.log('Full Event Object:', JSON.stringify(event, null, 2))

            // Log specific notification details
            console.log('Notification Title:', event?.notification?.title)
            console.log('Notification Body:', event?.notification?.body)
            console.log('Notification ID:', event?.notification?.notificationId)

            // Additional debug information
            console.log('Raw Notification Data:', event?.notification)
            console.groupEnd()
            const notification = event.notification
            addNotification({
                title: notification.title || 'Notification',
                body: notification.body || '',
                icon: notification.icon
            })
        })


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