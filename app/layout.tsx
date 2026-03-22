import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Footer from "@/components/globals/layout/Footer";
import { NavBar } from "@/components/globals/layout/NavBar";

// 1. Configure fonts as CSS variables
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

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
		<html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
			<body>
				{/* Providers wrapper for SpacetimeDB connection and context */}
				<Providers>
					<NavBar />

					<main>
                        {children}
                    </main>

					<Footer />
				</Providers>
			</body>
		</html>
	);
}