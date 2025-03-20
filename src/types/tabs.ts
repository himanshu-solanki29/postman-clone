export interface Tab {
  id: string;
  title: string;
  method: string;
  url: string;
  headers: string;
  body: string;
  response: string;
  activeTab: 'headers' | 'body';
  responseHeaders?: Record<string, string> | null;
  responseStatus?: number | null;
  responseTime?: number | null;
}

export interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
} 