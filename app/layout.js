import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { MarketplaceProvider } from "@/lib/marketplace-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Marketplace",
  description: "Buy and sell locally",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MarketplaceProvider>
          <Header />
          {children}
        </MarketplaceProvider>
      </body>
    </html>
  );
}
