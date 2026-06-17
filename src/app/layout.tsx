
import type { Metadata } from 'next';
import "./globals.css";
import Providers from './providers';
import MaintenanceOverlay from '@/components/shared/maintenance-overlay';

const IS_MAINTENANCE = false; // Toggle to true to put the site on maintenance

export const metadata: Metadata = {
  title: "Pranjal's Study Buddy",
  description: "Your personalized companion for JEE preparation.",
  icons: {
    icon: '/avatar.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {IS_MAINTENANCE ? (
          <MaintenanceOverlay />
        ) : (
          <Providers>{children}</Providers>
        )}
      </body>
    </html>
  );
}
