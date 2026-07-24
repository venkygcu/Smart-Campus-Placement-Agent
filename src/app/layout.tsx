import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlaceAI – AI-Powered Placement Portal",
  description:
    "Connect top talent with top companies. AI-powered resume parsing, smart shortlisting, and seamless placement management.",
  keywords: ["placement portal", "internship", "job portal", "AI hiring", "campus recruitment"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
