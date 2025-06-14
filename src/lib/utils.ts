import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeToInt (time: string) {
    return parseFloat(time.replace(':', '.')); // Convert HH:MM to a float for easier comparison 12.52 < 12.53
}

export function formatTimeZoneOffset (timezone: string) {
  return null
}