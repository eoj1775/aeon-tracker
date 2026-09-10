import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEON.NETWORK — r/SPX6900 Subreddit Tracker",
  description: "Public observation node tracking r/SPX6900 toward 69,000 subscribers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" style={{ ["--font-mono" as string]: "monospace" }}>
      <body className="min-h-full flex flex-col">
        <div className="aeon-vignette" />
        {children}
      </body>
    </html>
  );
}
