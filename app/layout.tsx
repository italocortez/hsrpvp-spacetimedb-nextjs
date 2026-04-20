import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Footer from "@/components/globals/layout/Footer";
import { NavBar } from "@/components/globals/layout/NavBar";
import { SafariWarning } from "@/components/globals/viewport/SafariWarning";
import { ViewportWriter } from "@/components/globals/viewport/ViewportWriter";

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
				{/* Phase 16 Plan 05 FOUND-08: dismissible amber banner above NavBar,
				    Safari-UA only. Client component; safe inside Server layout. */}
				<SafariWarning />

				{/* Providers wrapper for SpacetimeDB connection and context */}
				<Providers>
					{/* Phase 16 Plan 05 FOUND-10: null-render cookie writer.
					    Writes vp=desktop|mobile on mount + matchMedia change. */}
					<ViewportWriter />

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