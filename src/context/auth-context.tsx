

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareWarning, Info } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead } from '@/lib/notifications';
import { getRandomFeatureTip } from '@/lib/home';

export type AccessLevel = 'full' | 'limited';

type AuthContextType = {
  isAuthenticated: boolean;
  isLocked: boolean;
  isReloading: boolean;
  login: (accessLevel: AccessLevel) => void;
  logout: () => void;
  lockApp: () => void;
  unlockApp: (accessLevel: AccessLevel) => void;
  pauseLocking: (durationInMs: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [isLockingPaused, setIsLockingPaused] = useState(false);
  const lockPauseTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const sessionActive = sessionStorage.getItem('study-buddy-session-active') === 'true';
      const appLocked = localStorage.getItem('study-buddy-app-locked') === 'true';

      if (sessionActive) {
        setIsAuthenticated(true);
        if (appLocked) {
          setIsLocked(true);
        }
      }
    } catch (e) {
        console.error("Session/Local storage not available.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (accessLevel: AccessLevel) => {
    try {
        const currentAccessLevel = localStorage.getItem('study-buddy-access-level');
        const hasAccessChanged = currentAccessLevel && currentAccessLevel !== accessLevel;

        if (hasAccessChanged) {
            setIsReloading(true); // Set reloading state before reload
            localStorage.setItem('study-buddy-access-level', accessLevel);
            window.location.reload();
            return;
        }
        
        sessionStorage.setItem('study-buddy-session-active', 'true');
        localStorage.setItem('study-buddy-access-level', accessLevel);
        localStorage.setItem('study-buddy-app-locked', 'false'); // Unlock the app

        // --- Fetch notifications on successful login ---
        if (accessLevel === 'full') {
            const isProduction = window.location.href.includes("https://study-buddy-two-phi.vercel.app");
            if (isProduction) {
                 getUnreadNotifications().then(async notifications => {
                    if (notifications.length > 0) {
                        notifications.forEach(async (notif) => {
                            toast({
                                title: (
                                    <div className="flex items-center gap-2">
                                        <MessageSquareWarning className="h-5 w-5 text-primary" />
                                        <span>New Notification</span>
                                    </div>
                                ),
                                description: notif.text,
                                duration: 10000,
                            });
                            await markNotificationAsRead(notif.id);
                        });
                    } else {
                        // If no unread messages, show a feature tip
                        const featureTip = await getRandomFeatureTip();
                        toast({
                            title: (
                                <div className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-blue-500" />
                                    <span>Did you know?</span>
                                </div>
                            ),
                            description: featureTip,
                            duration: 12000,
                        });
                    }
                }).catch(error => {
                    console.error("Failed to check for notifications or tips on login:", error);
                });
            }
        }
        // --- End of notification fetching logic ---

    } catch (e) {
        console.error("Session/Local storage not available.");
    }
    setIsAuthenticated(true);
    setIsLocked(false);
  };

  const logout = () => {
    try {
        sessionStorage.removeItem('study-buddy-session-active');
        localStorage.removeItem('study-buddy-access-level');
        localStorage.removeItem('study-buddy-device-verified');
        localStorage.removeItem('study-buddy-app-locked'); // Clear lock on logout
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out."
        })
    } catch (e) {
        console.error("Session/Local storage not available.");
    }
    setIsAuthenticated(false);
    setIsLocked(false);
     // Reload to ensure all states are cleared properly
    window.location.reload();
  };

  const lockApp = useCallback(() => {
    if (isAuthenticated && !isLockingPaused) {
        try {
            localStorage.setItem('study-buddy-app-locked', 'true');
        } catch (e) {
             console.error("Local storage not available.");
        }
        setIsLocked(true);
    }
  }, [isAuthenticated, isLockingPaused]);

  const unlockApp = (accessLevel: AccessLevel) => {
    login(accessLevel);
  }

  const pauseLocking = (durationInMs: number) => {
    if (lockPauseTimer.current) {
        clearTimeout(lockPauseTimer.current);
    }
    setIsLockingPaused(true);
    lockPauseTimer.current = setTimeout(() => {
        setIsLockingPaused(false);
        lockPauseTimer.current = null;
    }, durationInMs);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLocked, isReloading, login, logout, lockApp, unlockApp, pauseLocking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
