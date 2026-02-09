import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Unit conversion helpers
export function cmToInches(cm: number): number {
  return cm / 2.54
}

export function inchesToCm(inches: number): number {
  return inches * 2.54
}

export function kgToLbs(kg: number): number {
  return kg * 2.2046226218
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.2046226218
}
