import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeToInt(time: string) {
  return parseFloat(time.replace(":", ".")); // Convert HH:MM to a float for easier comparison 12.52 < 12.53
}

function capitalizeFirstLetter(s: string) {
  return String(s[0]).toUpperCase() + String(s).slice(1);
}

export function displayFullName(
  firstName: string | null,
  lastName: string | null,
  username?: string | null,
): string {
  return firstName && lastName
    ? `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`
    : username || "User";
}
