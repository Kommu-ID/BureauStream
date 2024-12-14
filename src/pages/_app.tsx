import "@/styles/globals.css";

import type { AppType } from 'next/app';
import { ThemeProvider } from 'next-themes'
import { trpc } from '../utils/trpc';
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
};
export default trpc.withTRPC(MyApp);
