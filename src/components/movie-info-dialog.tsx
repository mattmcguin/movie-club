"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Movie } from "@/lib/types/database";

interface MovieInfoDialogProps {
  movie: Movie;
  children?: React.ReactNode;
}

export function MovieInfoDialog({ movie, children }: MovieInfoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 text-left">
            More info
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 sm:max-w-lg mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 text-xl">
            {movie.title}
          </DialogTitle>
          {movie.year && (
            <p className="text-sm text-zinc-500">{movie.year}</p>
          )}
        </DialogHeader>

        <div className="flex gap-4 pt-2">
          {movie.poster_url ? (
            <div className="relative h-48 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="flex h-48 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800">
              <FilmIcon className="h-12 w-12 text-zinc-600" />
            </div>
          )}
          <div className="flex-1">
            {movie.description ? (
              <p className="text-sm text-zinc-300 leading-relaxed">
                {movie.description}
              </p>
            ) : (
              <p className="text-sm text-zinc-500 italic">
                No description available.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

