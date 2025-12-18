"use client";

import { useState, useRef, useCallback, useTransition, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface PullToRefreshProps {
  children: ReactNode;
}

function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari specific
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    
    setIsPWA(isStandalone);
  }, []);

  return isPWA;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const isPWA = useIsPWA();
  const [isPending, startTransition] = useTransition();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only enable in PWA mode
    if (!isPWA || isRefreshing || isPending) return;

    // Only start pull if page is scrolled to top
    if (window.scrollY <= 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, [isPWA, isRefreshing, isPending]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing || isPending) return;

    // Cancel pull if user scrolled down
    if (window.scrollY > 0) {
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;

    if (delta > 0) {
      // Rubber band effect - diminishing returns as you pull further
      const resistance = 0.4;
      const distance = Math.min(delta * resistance, MAX_PULL);
      setPullDistance(distance);
    } else {
      // User is scrolling up, cancel pull
      isPullingRef.current = false;
      setPullDistance(0);
    }
  }, [isRefreshing, isPending]);

  const handleTouchEnd = useCallback(() => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing && !isPending) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      startTransition(() => {
        router.refresh();
        // Give a brief moment for the refresh animation
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      });
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, isPending, router]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showIndicator = isPWA && (pullDistance > 10 || isRefreshing || isPending);

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator - fixed position below header (PWA only) */}
      {isPWA && (
        <div
          className="fixed left-1/2 -translate-x-1/2 pointer-events-none z-50 transition-all duration-200"
          style={{
            top: 56 + 16, // header height + padding
            opacity: showIndicator ? 1 : 0,
            transform: `translateX(-50%) scale(${showIndicator ? 1 : 0.5})`,
          }}
        >
          <div
            className={`flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 shadow-lg ${
              isRefreshing || isPending ? "" : ""
            }`}
            style={{
              width: 40,
              height: 40,
              transform: `rotate(${progress * 360}deg)`,
              transition: isRefreshing ? "none" : "transform 0.1s ease-out",
            }}
          >
            {isRefreshing || isPending ? (
              <SpinnerIcon className="h-5 w-5 text-amber-400 animate-spin" />
            ) : (
              <ArrowDownIcon
                className="h-5 w-5 text-zinc-400"
                style={{
                  opacity: progress,
                  transform: `rotate(${progress >= 1 ? 180 : 0}deg)`,
                  transition: "transform 0.2s ease-out",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}

function ArrowDownIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

