// src/lib/api.ts
import type { ApiResponse } from '@/types/events';
import events from '@/data/events.json';

export async function fetchEvents(): Promise<ApiResponse> {
  return events as ApiResponse;
}