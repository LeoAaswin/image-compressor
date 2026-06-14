import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trackUpload(files: File[]) {
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  fetch('/api/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filesCount: files.length, bytesCount: totalSize }),
  }).catch(() => {});
}
