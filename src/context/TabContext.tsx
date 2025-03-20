import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Tab, TabState } from '../types/tabs';
import { HistoryItem } from '../types/history';

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  createTabFromHistory: (historyItem: HistoryItem) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TabState>({
    tabs: [],
    activeTabId: null,
  });

  // Add initial tab when the app starts
  useEffect(() => {
    if (state.tabs.length === 0) {
      const initialTab: Tab = {
        id: Date.now().toString(),
        title: 'New Request',
        method: 'GET',
        url: '',
        headers: '',
        body: '',
        response: '',
        activeTab: 'headers',
        responseTime: null,
        responseStatus: null,
        responseHeaders: null
      };
      setState({
        tabs: [initialTab],
        activeTabId: initialTab.id,
      });
    }
  }, []);

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Request',
      method: 'GET',
      url: '',
      headers: '',
      body: '',
      response: '',
      activeTab: 'headers',
      responseTime: null,
      responseStatus: null,
      responseHeaders: null
    };
    setState(prev => ({
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
  };

  const createTabFromHistory = (historyItem: HistoryItem) => {
    // Convert headers object to string format
    let headersString = '';
    if (historyItem.headers) {
      headersString = Object.entries(historyItem.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    
    // Ensure the method is a valid method type
    const validMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(historyItem.method) 
      ? historyItem.method 
      : 'GET';
    
    // Get hostname from URL safely
    let hostname = historyItem.url;
    try {
      if (historyItem.url.startsWith('http')) {
        hostname = new URL(historyItem.url).hostname;
      }
    } catch (error) {
      console.error('Invalid URL:', error);
      // Keep the original URL if parsing fails
    }
    
    const newTab: Tab = {
      id: Date.now().toString(),
      title: `${validMethod} ${hostname}`,
      method: validMethod,
      url: historyItem.url,
      headers: headersString,
      body: '', // Body data is not typically stored in history
      response: '',
      activeTab: 'headers',
      responseTime: null,
      responseStatus: null,
      responseHeaders: null
    };
    
    setState(prev => ({
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
  };

  const closeTab = (id: string) => {
    setState(prev => {
      const newTabs = prev.tabs.filter(tab => tab.id !== id);
      const newActiveId = prev.activeTabId === id
        ? (newTabs[newTabs.length - 1]?.id || null)
        : prev.activeTabId;
      return {
        tabs: newTabs,
        activeTabId: newActiveId,
      };
    });
  };

  const setActiveTab = (id: string) => {
    setState(prev => ({
      ...prev,
      activeTabId: id,
    }));
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === id ? { ...tab, ...updates } : tab
      ),
    }));
  };

  const value = {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    addTab,
    closeTab,
    setActiveTab,
    updateTab,
    createTabFromHistory,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
} 