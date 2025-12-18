"use client";

import { useState, useRef, useCallback, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface PullToRefreshProps {
  children: ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || isRefreshing || isPending) return;

    // Only start pull if at top of scroll
    if (container.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, [isRefreshing, isPending]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing || isPending) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;

    if (delta > 0) {
      // Rubber band effect - diminishing returns as you pull further
      const resistance = 0.4;
      const distance = Math.min(delta * resistance, MAX_PULL);
      setPullDistance(distance);
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
  const showIndicator = pullDistance > 10 || isRefreshing || isPending;

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto overscroll-y-contain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator - fixed to appear from under the header */}
      <div
        className="fixed left-0 right-0 flex items-end justify-center pointer-events-none z-40 transition-opacity duration-200"
        style={{
          top: 0,
          height: 56 + pullDistance, // 56px = mobile header height (h-14)
          paddingTop: 56,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <div
          className={`flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 ${
            isRefreshing || isPending ? "animate-pulse" : ""
          }`}
          style={{
            width: 36,
            height: 36,
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

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPullingRef.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
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

