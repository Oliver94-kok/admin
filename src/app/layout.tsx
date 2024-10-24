"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import OneSignal from "react-onesignal";
import { ReactQueryClientProvider } from "@/components/QueryClientProvider ";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();
  useEffect(() => {
    // Ensure this code runs only on the client side
    if (typeof window !== 'undefined') {
      // initializeOneSignal()
    }
  }, []);
  const initializeOneSignal = async () => {
    OneSignal.init({
      appId: '48db9e0a-c176-4c30-ba58-44630340624f',
      // You can add other initialization options here
      notifyButton: {
        enable: true,
      },
      // Uncomment the below line to run on localhost. See: https://documentation.onesignal.com/docs/local-testing
      allowLocalhostAsSecureOrigin: true,

    }).then(async () => {
      // OneSignal.Debug.setLogLevel('trace');
      await OneSignal.Slidedown.promptPush();
      await OneSignal.Notifications.requestPermission();
      OneSignal.User.addTag('role', 'admin')
    })


  }
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (

    <html lang="en">
      <body suppressHydrationWarning={true}>
        {loading ? <Loader /> : children}
        <ToastContainer />
      </body>
    </html>

  );
}
