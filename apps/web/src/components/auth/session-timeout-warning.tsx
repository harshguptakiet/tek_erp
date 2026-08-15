/**
 * FR-AUTH-016: Session Timeout Warning
 * Warns user at 25 minutes of inactivity, auto-logout at 30 minutes
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD_MS = 25 * 60 * 1000; // 25 minutes (show warning)
const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (ping backend)

export function SessionTimeoutWarning() {
  const { isAuthenticated, logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset activity timestamp
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    
    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Set warning timer (25 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsRemaining(300); // 5 minutes remaining
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_THRESHOLD_MS);
    
    // Set logout timer (30 minutes)
    logoutTimerRef.current = setTimeout(() => {
      handleTimeout();
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    setShowWarning(false);
    logout();
    window.location.href = '/auth/login?reason=timeout';
  }, [logout]);

  // Ping backend to keep session alive
  const pingBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      // FR-AUTH-016: Use dedicated ping endpoint to update last activity
      await apiClient.post('/auth/sessions/ping');
    } catch (error) {
      // Silently fail - session will expire naturally
    }
  }, [isAuthenticated]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    // Only reset if more than 1 minute has passed (debounce)
    if (timeSinceLastActivity > 60000) {
      resetActivity();
      pingBackend();
    }
  }, [isAuthenticated, resetActivity, pingBackend]);

  // Stay logged in button handler
  const handleStayLoggedIn = useCallback(() => {
    resetActivity();
    pingBackend();
  }, [resetActivity, pingBackend]);

  // Initialize activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial setup
    resetActivity();
    
    // Ping interval (every 5 minutes if user is active)
    pingTimerRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity < PING_INTERVAL_MS) {
        pingBackend();
      }
    }, PING_INTERVAL_MS);

    // Activity event listeners
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetActivity, handleActivity, pingBackend]);

  if (!showWarning || !isAuthenticated) {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border bg-[hsl(var(--card))] shadow-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Session Timeout Warning</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            You'll be automatically logged out due to inactivity
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 py-4">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-3xl font-bold tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button onClick={handleStayLoggedIn} className="w-full">
            Stay Logged In
          </Button>
          <Button
            onClick={() => {
              logout();
              window.location.href = '/auth/login';
            }}
            variant="outline"
            className="w-full"
          >
            Logout Now
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
          Click "Stay Logged In" to continue your session
        </p>
      </div>
    </div>
  );
}
