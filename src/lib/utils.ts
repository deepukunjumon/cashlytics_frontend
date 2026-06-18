import { clsx, type ClassValue } from "clsx"
import { format, parseISO } from "date-fns"
import { isAxiosError } from "axios"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string): string {
  return format(parseISO(date), "MMM d, yyyy")
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Something went wrong. Please try again."
  }

  return "Something went wrong. Please try again."
}
