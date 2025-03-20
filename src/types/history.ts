export interface HistoryItem {
  id: string;
  method: string;
  url: string;
  status: number;
  response: string;
  timestamp: number;
  time: number;
  headers: Record<string, string> | null;
}

export interface HistoryState {
  items: HistoryItem[];
} 