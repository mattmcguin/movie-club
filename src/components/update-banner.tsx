"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, XIcon } from "lucide-react";

function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  return isPWA;
}

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const isPWA = useIsPWA();

  useEffect(() => {
    // Only check for updates in PWA mode
    if (!isPWA || !("serviceWorker" in navigator)) return;

    // Listen for controller changes - this fires when a new SW takes control
    const handleControllerChange = () => {
      setUpdateAvailable(true);
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, [isPWA]);

  if (!updateAvailable) return null;

  const handleRefresh = () => {
    // Force reload to get fresh bundle
    window.location.reload();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-zinc-900/95 px-4 py-3 shadow-lg backdrop-blur">
        <p className="text-sm text-zinc-200">Update available</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRefresh}
            className="h-8 gap-1.5 bg-amber-500 text-zinc-900 hover:bg-amber-400"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <button
            onClick={handleDismiss}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

