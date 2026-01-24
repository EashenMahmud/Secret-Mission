import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const baseUrl = import.meta.env.VITE_API_ASSET_URL || '';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');

  return `${cleanBase}/${cleanPath}`;
}
