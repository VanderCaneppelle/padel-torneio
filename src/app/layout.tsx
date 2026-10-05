import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import Script from "next/script";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quoracup.vercel.app"),
  title: "QuoraCup Padel",
  description: "Inscrições para os torneios semanais de padel",
  openGraph: {
    title: "QuoraCup Padel",
    description: "Inscrições para os torneios semanais de padel",
    url: "https://quoracup.vercel.app",
    siteName: "QuoraCup Padel",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yt5vmkpf9p");
          `}
        </Script>
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
