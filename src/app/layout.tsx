import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agro Decision Platform",
  description: "Платформа поддержки принятия решений в сельском хозяйстве Узбекистана",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>
          <AppHeader />
          <main className="mx-auto min-h-[calc(100vh-65px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
