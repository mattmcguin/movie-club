import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns an RGB color string based on score (0-10)
 * 0 = red, 5 = yellow, 10 = green
 */
export function getScoreColor(score: number): string {
  // Clamp score between 0 and 10
  const s = Math.max(0, Math.min(10, score));
  
  // Red to Yellow (0-5): R stays at 255, G goes from 0 to 255
  // Yellow to Green (5-10): R goes from 255 to 0, G stays at 255
  let r: number, g: number;
  
  if (s <= 5) {
    r = 255;
    g = Math.round((s / 5) * 255);
  } else {
    r = Math.round(((10 - s) / 5) * 255);
    g = 255;
  }
  
  return `rgb(${r}, ${g}, 50)`;
}
