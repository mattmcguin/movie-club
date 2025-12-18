"use client";

import { useState, useTransition } from "react";
import { updateReview } from "@/actions/ratings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ExpandableReviewProps {
  movieId: string;
  review: string | null;
  isCurrentUser: boolean;
}

export function ExpandableReview({
  movieId,
  review,
  isCurrentUser,
}: ExpandableReviewProps) {
  const [isPending, startTransition] = useTransition();
  const [localReview, setLocalReview] = useState(review ?? "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateReview(movieId, localReview);
      if (!result.error) {
        setIsOpen(false);
      }
    });
  };

  const hasReview = review && review.trim().length > 0;

  if (!isCurrentUser && !hasReview) {
    return <span className="text-xs text-zinc-600">-</span>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-2 text-xs ${
            hasReview
              ? "text-amber-400 hover:text-amber-300"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
        >
          {hasReview ? (
            <span className="flex items-center gap-1">
              <MessageIcon className="h-3 w-3" />
              Review
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <PlusIcon className="h-3 w-3" />
              Add
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-zinc-900 border-zinc-700 p-4"
        align="center"
      >
        {isCurrentUser ? (
          <div className="space-y-3">
            <Textarea
              value={localReview}
              onChange={(e) => setLocalReview(e.target.value)}
              placeholder="Write your thoughts about this movie..."
              className="min-h-[100px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-300 whitespace-pre-wrap">
            {review}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function MessageIcon({ className }: { className?: string }) {
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

