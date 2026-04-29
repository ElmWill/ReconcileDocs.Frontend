import type { AppProps } from "next/app";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { MainLayout } from "@/components/layouts/MainLayout";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = (Component as typeof Component & { layout?: (page: React.ReactElement) => React.ReactElement }).layout;
  const page = <Component {...pageProps} />;

  return (
    <div className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} min-h-screen bg-slate-950 text-sand-100`}>
      {getLayout ? getLayout(page) : <MainLayout>{page}</MainLayout>}
    </div>
  );
}