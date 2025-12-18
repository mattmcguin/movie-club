"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import Image from "next/image";
import { addMovie } from "@/actions/movies";
import { getPosterUrl, getYear } from "@/lib/tmdb";
import type { TMDBMovie, TMDBSearchResponse } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AddMovieDialogProps {
  fullWidth?: boolean;
  compact?: boolean;
}

export function AddMovieDialog({ fullWidth = false, compact = false }: AddMovieDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isPending, startTransition] = useTransition();

  // Manual entry state
  const [manualTitle, setManualTitle] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualPosterUrl, setManualPosterUrl] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tmdb?query=${encodeURIComponent(query)}`
      );
      const data: TMDBSearchResponse = await response.json();
      setSearchResults(data.results?.slice(0, 10) ?? []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search movies");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced auto-search: triggers 500ms after user stops typing
  useEffect(() => {
    if (!searchQuery.trim() || selectedMovie) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedMovie, handleSearch]);

  const handleSelectMovie = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleAddFromTMDB = () => {
    if (!selectedMovie) return;

    const formData = new FormData();
    formData.set("title", selectedMovie.title);
    formData.set("year", getYear(selectedMovie.release_date)?.toString() ?? "");
    formData.set("tmdbId", selectedMovie.id.toString());
    formData.set("posterUrl", getPosterUrl(selectedMovie.poster_path) ?? "");
    formData.set("description", selectedMovie.overview);

    startTransition(async () => {
      const result = await addMovie(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${selectedMovie.title}" added to the club!`);
        resetState();
        setOpen(false);
      }
    });
  };

  const handleAddManual = () => {
    if (!manualTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    const formData = new FormData();
    formData.set("title", manualTitle);
    formData.set("year", manualYear);
    formData.set("posterUrl", manualPosterUrl);
    formData.set("description", manualDescription);

    startTransition(async () => {
      const result = await addMovie(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${manualTitle}" added to the club!`);
        resetState();
        setOpen(false);
      }
    });
  };

  const resetState = () => {
    setMode("search");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedMovie(null);
    setManualTitle("");
    setManualYear("");
    setManualPosterUrl("");
    setManualDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetState();
    }}>
      <DialogTrigger asChild>
        <Button 
          className={`bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white ${
            fullWidth ? "w-full h-12 text-base" : compact ? "h-9 px-3 text-sm" : ""
          }`}
        >
          <PlusIcon className={`mr-1.5 ${fullWidth ? "h-5 w-5" : "h-4 w-4"}`} />
          Add Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add a Movie</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Search TMDB or add manually
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant={mode === "search" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("search")}
            className={mode === "search" ? "bg-amber-500 hover:bg-amber-600" : "border-zinc-700 text-zinc-400"}
          >
            Search TMDB
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
            className={mode === "manual" ? "bg-amber-500 hover:bg-amber-600" : "border-zinc-700 text-zinc-400"}
          >
            Manual Entry
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
        {mode === "search" ? (
          <div className="space-y-4">
            {/* Search Input */}
            {!selectedMovie && (
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Start typing to search..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 pr-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {searchResults.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
                  >
                    {movie.poster_path ? (
                      <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded bg-zinc-700">
                        <Image
                          src={getPosterUrl(movie.poster_path, "w92") ?? ""}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-zinc-700">
                        <FilmIcon className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-100">{movie.title}</p>
                      <p className="text-sm text-zinc-500">
                        {getYear(movie.release_date) ?? "Unknown year"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Movie Preview */}
            {selectedMovie && (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/50">
                  {selectedMovie.poster_path ? (
                    <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-md bg-zinc-700">
                      <Image
                        src={getPosterUrl(selectedMovie.poster_path) ?? ""}
                        alt={selectedMovie.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 w-20 flex-shrink-0 items-center justify-center rounded-md bg-zinc-700">
                      <FilmIcon className="h-6 w-6 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-100">{selectedMovie.title}</h4>
                    <p className="text-sm text-zinc-500 mb-2">
                      {getYear(selectedMovie.release_date) ?? "Unknown year"}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-3">
                      {selectedMovie.overview}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMovie(null)}
                    className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  >
                    Change
                  </Button>
                  <Button
                    onClick={handleAddFromTMDB}
                    disabled={isPending}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isPending ? "Adding..." : "Add Movie"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manual Entry Form */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualTitle" className="text-zinc-300">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="manualTitle"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Movie title"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualYear" className="text-zinc-300">
                Year
              </Label>
              <Input
                id="manualYear"
                type="number"
                value={manualYear}
                onChange={(e) => setManualYear(e.target.value)}
                placeholder="2024"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualPosterUrl" className="text-zinc-300">
                Poster URL
              </Label>
              <Input
                id="manualPosterUrl"
                value={manualPosterUrl}
                onChange={(e) => setManualPosterUrl(e.target.value)}
                placeholder="https://..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualDescription" className="text-zinc-300">
                Description
              </Label>
              <Textarea
                id="manualDescription"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Brief description..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleAddManual}
              disabled={isPending || !manualTitle.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isPending ? "Adding..." : "Add Movie"}
            </Button>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
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

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
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

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

