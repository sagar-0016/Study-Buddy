
"use client";

import { useEffect, useState, useRef } from 'react';
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { BackgroundProvider, useBackground } from '@/context/background-context';
import { ClassModeProvider, useClassMode } from '@/context/class-mode-context';
import LoginFlow from '@/components/auth/login-flow';
import { Loader2 } from 'lucide-react';
import UnlockScreen from '@/components/auth/unlock-screen';
import { cn } from '@/lib/utils';


function AppBackground() {
  const { isAuthenticated } = useAuth();
  const { backgroundImage } = useBackground();

  // The background is only shown when the user is authenticated.
  // The login flow will have the default solid color background.
  if (!isAuthenticated) {
    return null;
  }

  if (backgroundImage) {
    return (
      <div
        className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
    );
  }

  // Default grid background
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-green-50 dark:bg-black">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
    </div>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLocked, lockApp, unlockApp, isReloading } = useAuth();
  const { isClassMode } = useClassMode();
  const lockPauseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleBlur = () => {
      // Add a small timeout to allow the activeElement to be updated
      setTimeout(() => {
        // Check if the focus has moved to an iframe within our app
        if (document.activeElement?.tagName === 'IFRAME') {
          // You could add more specific checks here if needed, e.g.,
          // by adding a data-attribute to your floating browser's iframe
          return;
        }

        if (isAuthenticated && !isLocked) {
          lockApp();
        }
      }, 0);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lockApp();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, isLocked, lockApp]);

  useEffect(() => {
    const logAppOpen = async () => {
      try {
        if (isAuthenticated && !isLocked) { // Only log if fully unlocked
            const isOwnerDevice = localStorage.getItem('is-owner-device') === 'true';
            const isProduction = window.location.href.includes("https://study-buddy-two-phi.vercel.app");

            if (!isOwnerDevice && isProduction) {
                const accessLevel = localStorage.getItem('study-buddy-access-level') || 'unknown';
                await addDoc(collection(db, "opened"), {
                  time: new Date(),
                  accessLevel: accessLevel,
                  device: {
                    userAgent: navigator.userAgent,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    online: navigator.onLine,
                  }
                });
            }
        }
      } catch (error) {
        console.error("Error during app open logging: ", error);
      }
    };

    logAppOpen();
  }, [isAuthenticated, isLocked]);

  if (isReloading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginFlow />;
  }
  
  if (isLocked) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <UnlockScreen onUnlock={unlockApp} isRelocking={true} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isClassMode ? "md:pl-[72px]" : "md:pl-[220px] lg:pl-[280px]"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BackgroundProvider>
        <ClassModeProvider>
            <AppBackground />
            <AppContent>{children}</AppContent>
            <Toaster />
        </ClassModeProvider>
      </BackgroundProvider>
    </AuthProvider>
  );
}
