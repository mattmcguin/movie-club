"use client";

import { useState, useTransition } from "react";
import { toggleWatched, updateScore } from "@/actions/ratings";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExpandableReview } from "@/components/expandable-review";
import type { MovieRating, Profile } from "@/lib/types/database";

interface RatingCellProps {
  movieId: string;
  rating: (MovieRating & { profile: Profile }) | null;
  isCurrentUser: boolean;
}

export function RatingCell({ movieId, rating, isCurrentUser }: RatingCellProps) {
  const [isPending, startTransition] = useTransition();
  const [localWatched, setLocalWatched] = useState(rating?.watched ?? false);
  const [localScore, setLocalScore] = useState<number | null>(rating?.score ?? null);

  const handleToggleWatched = () => {
    if (!isCurrentUser) return;

    setLocalWatched(!localWatched);
    startTransition(async () => {
      const result = await toggleWatched(movieId);
      if (result.error) {
        setLocalWatched(localWatched);
      }
    });
  };

  const handleScoreChange = (value: string) => {
    if (!isCurrentUser) return;

    const newScore = value === "none" ? null : parseInt(value, 10);
    setLocalScore(newScore);
    startTransition(async () => {
      const result = await updateScore(movieId, newScore);
      if (result.error) {
        setLocalScore(rating?.score ?? null);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 min-w-[120px]">
      {/* Watched Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleWatched}
              disabled={!isCurrentUser || isPending}
              className={`h-8 w-8 rounded-full p-0 transition-all ${
                localWatched
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
              } ${!isCurrentUser ? "cursor-default opacity-70" : ""}`}
            >
              {localWatched ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{localWatched ? "Watched" : "Not watched"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Score Selector */}
      {isCurrentUser ? (
        <Select
          value={localScore?.toString() ?? "none"}
          onValueChange={handleScoreChange}
          disabled={isPending}
        >
          <SelectTrigger className="h-7 w-16 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="none" className="text-zinc-400">
              -
            </SelectItem>
            {[...Array(11)].map((_, i) => (
              <SelectItem key={i} value={i.toString()} className="text-zinc-300">
                {i}/10
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-xs text-zinc-400 h-7 flex items-center">
          {localScore !== null ? `${localScore}/10` : "-"}
        </span>
      )}

      {/* Review */}
      <ExpandableReview
        movieId={movieId}
        review={rating?.review ?? null}
        isCurrentUser={isCurrentUser}
      />
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
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
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

