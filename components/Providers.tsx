'use client';

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/components/Notification";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <PWAInstallPrompt />
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}
