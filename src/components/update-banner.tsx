"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update().catch(() => {
            // Silently fail - network might be unavailable
          });
        };

        // Check on visibility change (when app comes back to foreground)
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            checkForUpdates();
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Listen for new service worker installation
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Also check when the page loads
        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      });

      // Listen for controller change (new SW activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Tell the waiting service worker to take control
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        } else {
          // Just reload if no waiting worker
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="flex items-center gap-3 rounded-lg bg-amber-500/90 backdrop-blur-sm px-4 py-3 shadow-lg">
        <div className="flex-1 md:flex-none">
          <p className="text-sm font-medium text-zinc-900">Update available</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleUpdate}
          className="bg-zinc-900 text-white hover:bg-zinc-800"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}

