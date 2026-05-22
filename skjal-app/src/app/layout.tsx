import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SK Jalrakshak Innovations | Smart Water Intelligence",
  description:
    "SK Jalrakshak Innovations — smart water intelligence, edge telemetry, cloud dashboards & predictive analytics. CIN: U26517AP2025PTC119413",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
