import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Affiliate Content Studio", description: "Crie roteiros e storyboards para seus vídeos de afiliados." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
