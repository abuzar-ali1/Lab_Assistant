import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/Components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "LabSaathi — Lab reports, made human",
    template: "%s · LabSaathi",
  },
  description: "Turn lab report numbers into a clear bilingual health brief with plain-English and Urdu explanations plus doctor-ready questions.",
  keywords: ["lab report explainer", "Urdu health app", "medical reports", "patient health literacy", "Pakistan health tech"],
  openGraph: {
    title: "LabSaathi — Lab reports, made human",
    description: "Understand what needs attention, what it means, and what to ask your doctor next—in English and Urdu.",
    type: "website",
    siteName: "LabSaathi",
    images: [{ url: "/og.png", alt: "LabSaathi — Lab reports, made human" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LabSaathi — Lab reports, made human",
    description: "A bilingual health clarity companion for your lab reports.",
    images: ["/og.png"],
  },
};

export default function RootLayout({   
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
