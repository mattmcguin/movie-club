export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export function getPosterUrl(posterPath: string | null, size: string = "w342"): string | null {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export function getYear(releaseDate: string | null): number | null {
  if (!releaseDate) return null;
  const year = parseInt(releaseDate.split("-")[0], 10);
  return isNaN(year) ? null : year;
}

