import type { Metadata } from "next";
import AppProvider from "@/app/components/ui/AppProvider";
import "@/app/globals.css";
import AppLayout from "./components/ui/Layout";

export const metadata: Metadata = {
  title: "Academic Management",
  description: "Academic Management Dashboard",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
