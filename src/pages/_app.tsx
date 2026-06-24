import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import '../styles/globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <Head>
        <title>Abex Clubs</title>
        <meta name="description" content="Plataforma de assinaturas para casas de eventos" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>" />
      </Head>

      <SessionProvider session={session}>
        <ThemeProvider>
          <LanguageProvider>
            <Component {...pageProps} />
          </LanguageProvider>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
export default MyApp;
