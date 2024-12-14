import "@/styles/globals.css";

import type { AppType } from 'next/app';
import { ThemeProvider } from 'next-themes'
import { trpc } from '../utils/trpc';
import { AuthProvider } from "@/components/auth-provider";
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
};
export default trpc.withTRPC(MyApp);
