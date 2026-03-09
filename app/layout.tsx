import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 1. Configure the Inter font
const inter = Inter({ subsets: ["latin"] });

// 2. Update the metadata for SEO and browser tabs
export const metadata: Metadata = {
	title: "IPC Battlegrounds | Honkai Star Rail PvP",
	description:
		"Drafting interface and team builder for Honkai Star Rail PvP matches.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body className={inter.className}>
				{/* 3. Apply the font class globally to the body */}
				{/* Providers wrapper for SpacetimeDB connection and context */}
				<Providers>
					<Header />

					<main>{children}</main>

					<Footer />
				</Providers>
			</body>
		</html>
	);
}