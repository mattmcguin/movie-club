"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/actions/ratings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { MovieRating } from "@/lib/types/database";

interface ReviewDialogProps {
  movieId: string;
  movieTitle: string;
  existingRating: MovieRating | null;
  variant?: "default" | "mobile";
}

export function ReviewDialog({
  movieId,
  movieTitle,
  existingRating,
  variant = "default",
}: ReviewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number>(existingRating?.score ?? 5);
  const [review, setReview] = useState(existingRating?.review ?? "");

  const hasReviewed = existingRating?.watched ?? false;

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitReview(movieId, score, review || null);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted!");
        setIsOpen(false);
      }
    });
  };

  const isMobile = variant === "mobile";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${
            isMobile
              ? hasReviewed
                ? "h-11 px-4 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 gap-2"
                : "h-11 px-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
              : hasReviewed
              ? "h-8 px-3 text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "h-8 px-3 text-sm bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          {hasReviewed ? (
            <>
              <CheckIcon className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
              <span className={isMobile ? "text-sm font-medium" : "text-xs"}>
                {existingRating?.score?.toFixed(1)}/10
              </span>
              {existingRating?.review && (
                <MessageIcon className={isMobile ? "h-4 w-4 ml-1" : "h-3 w-3 ml-1"} />
              )}
            </>
          ) : (
            <>
              <StarIcon className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
              <span className={isMobile ? "text-sm font-medium" : "text-xs"}>Review</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {hasReviewed ? "Update Review" : "Review Movie"}
          </DialogTitle>
          <p className="text-sm text-zinc-400 mt-1">{movieTitle}</p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Score Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-base">
                Score <span className="text-amber-400">*</span>
              </Label>
              <span className="text-xl font-bold text-amber-400">
                {score.toFixed(1)}<span className="text-sm text-zinc-500 font-normal">/10</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => setScore(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 px-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label className="text-zinc-300 text-base">
              Review <span className="text-zinc-500">(optional)</span>
            </Label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think of the movie?"
              className="min-h-[120px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none text-base"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 h-12 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              {isPending ? "Saving..." : hasReviewed ? "Update" : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

