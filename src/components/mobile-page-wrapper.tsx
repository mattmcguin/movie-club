"use client";

import { type ReactNode } from "react";
import { PullToRefresh } from "@/components/pull-to-refresh";

interface MobilePageWrapperProps {
  children: ReactNode;
}

export function MobilePageWrapper({ children }: MobilePageWrapperProps) {
  return (
    <>
      {/* Mobile: wrap with pull to refresh */}
      <div className="md:hidden">
        <PullToRefresh>
          {children}
        </PullToRefresh>
      </div>
      
      {/* Desktop: render normally */}
      <div className="hidden md:block">
        {children}
      </div>
    </>
  );
}

