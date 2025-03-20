import { useState } from 'react';
import axios from 'axios';
import { useHistory } from '../context/HistoryContext';
import { useTabs } from '../context/TabContext';
import { Tab as TabType } from '../types/tabs';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}

const COMMON_HEADERS = [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Content-Type', value: 'application/x-www-form-urlencoded' },
  { name: 'Content-Type', value: 'multipart/form-data' },
  { name: 'Accept', value: 'application/json' },
  { name: 'Authorization', value: 'Bearer ' },
  { name: 'X-API-Key', value: '' },
  { name: 'User-Agent', value: 'PostmanClone/1.0' },
  { name: 'Cache-Control', value: 'no-cache' },
  { name: 'Origin', value: '' },
  { name: 'Accept-Language', value: 'en-US,en;q=0.9' }
];

const RequestTab = ({ tab, onClose }: { tab: TabType; onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [selectedHeader, setSelectedHeader] = useState('');
  const [responseTime, setResponseTime] = useState<number | null>(tab.responseTime || null);
  const [responseStatus, setResponseStatus] = useState<number | null>(tab.responseStatus || null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(tab.responseHeaders || null);
  const { updateTab } = useTabs();
  const { addToHistory } = useHistory();

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      setUrlError('');
      return true;
    } catch (e) {
      setUrlError('Please enter a valid URL (e.g., https://api.example.com)');
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    updateTab(tab.id, { url: newUrl });
    if (newUrl) {
      validateUrl(newUrl);
    } else {
      setUrlError('');
    }
  };

  const updateTabTitle = (method: string, url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      updateTab(tab.id, { title: `${method} ${hostname}` });
    } catch (e) {
      updateTab(tab.id, { title: `${method} Request` });
    }
  };

  const addHeader = () => {
    if (!selectedHeader) return;
    
    const header = COMMON_HEADERS.find(h => `${h.name}: ${h.value}` === selectedHeader);
    if (!header) return;

    const headerString = `${header.name}: ${header.value}`;
    const currentHeaders = tab.headers.trim();
    
    // Check if header already exists
    const headerExists = currentHeaders.split('\n').some(line => 
      line.startsWith(`${header.name}:`)
    );
    
    if (headerExists) {
      // Replace existing header
      const updatedHeaders = currentHeaders.split('\n').map(line => 
        line.startsWith(`${header.name}:`) ? headerString : line
      ).join('\n');
      updateTab(tab.id, { headers: updatedHeaders });
    } else {
      // Add new header
      const newHeaders = currentHeaders 
        ? `${currentHeaders}\n${headerString}` 
        : headerString;
      updateTab(tab.id, { headers: newHeaders });
    }
    
    setSelectedHeader('');
  };

  const handleSendRequest = async () => {
    if (!tab.url) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!validateUrl(tab.url)) {
      return;
    }

    setIsLoading(true);
    setResponseTime(null);
    setResponseStatus(null);
    setResponseHeaders(null);
    
    // Clear response data in tab state
    updateTab(tab.id, { 
      response: '',
      responseTime: null,
      responseStatus: null,
      responseHeaders: null
    });
    
    const startTime = Date.now();
    try {
      const headersObj = tab.headers
        .split('\n')
        .filter(line => line.trim())
        .reduce((acc, line) => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      let response;
      if (tab.method === 'GET') {
        response = await axios.get(tab.url, { headers: headersObj });
      } else {
        response = await axios({
          method: tab.method,
          url: tab.url,
          headers: headersObj,
          data: tab.body ? JSON.parse(tab.body) : undefined,
        });
      }

      const endTime = Date.now();
      const timeElapsed = endTime - startTime;
      
      setResponseTime(timeElapsed);
      setResponseStatus(response.status);
      setResponseHeaders(response.headers as Record<string, string>);

      const responseData = JSON.stringify(response.data, null, 2);
      updateTab(tab.id, { 
        response: responseData,
        responseTime: timeElapsed,
        responseStatus: response.status,
        responseHeaders: response.headers as Record<string, string>
      });
      updateTabTitle(tab.method, tab.url);

      // Add to history
      addToHistory({
        method: tab.method,
        url: tab.url,
        status: response.status,
        response: responseData,
        time: timeElapsed,
        headers: response.headers as Record<string, string>,
      });
    } catch (error) {
      const endTime = Date.now();
      const timeElapsed = endTime - startTime;
      
      const errorStatus = error instanceof Error && 'response' in error ? (error as any).response?.status : 0;
      const errorHeaders = error instanceof Error && 'response' in error ? (error as any).response?.headers : null;
      
      setResponseTime(timeElapsed);
      setResponseStatus(errorStatus);
      setResponseHeaders(errorHeaders);

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      updateTab(tab.id, { 
        response: errorMessage,
        responseTime: timeElapsed,
        responseStatus: errorStatus,
        responseHeaders: errorHeaders
      });
      updateTabTitle(tab.method, tab.url);
      
      // Add error to history
      addToHistory({
        method: tab.method,
        url: tab.url,
        status: errorStatus,
        response: errorMessage,
        time: timeElapsed,
        headers: errorHeaders,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = () => {
    updateTab(tab.id, { 
      response: '',
      responseTime: null,
      responseStatus: null,
      responseHeaders: null
    });
    setResponseTime(null);
    setResponseStatus(null);
    setResponseHeaders(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={tab.method}
              onChange={(e) => updateTab(tab.id, { method: e.target.value })}
              className="appearance-none bg-gray-800 border border-gray-700 rounded-l px-3 py-1.5 pr-7 text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer min-w-[100px] text-sm"
            >
              {methods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={tab.url}
              onChange={handleUrlChange}
              placeholder="Enter URL (e.g., https://api.example.com)"
              className={`input-field w-full rounded-r ${urlError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {urlError && (
              <p className="text-red-500 text-xs mt-1">{urlError}</p>
            )}
          </div>
          <button
            onClick={handleSendRequest}
            disabled={isLoading || !tab.url || !!urlError}
            className="btn-primary flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span>⚡</span>
                <span className="text-sm">Sending...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span className="text-sm">Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col" style={{ height: "30%" }}>
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => updateTab(tab.id, { activeTab: 'headers' })}
              className={`tab-button ${tab.activeTab === 'headers' ? 'tab-button-active' : ''}`}
            >
              Headers
            </button>
            <button
              onClick={() => updateTab(tab.id, { activeTab: 'body' })}
              className={`tab-button ${tab.activeTab === 'body' ? 'tab-button-active' : ''}`}
            >
              Body
            </button>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-auto">
          {tab.activeTab === 'headers' ? (
            <div className="h-full flex flex-col">
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <select
                    value={selectedHeader}
                    onChange={(e) => setSelectedHeader(e.target.value)}
                    className="appearance-none bg-gray-800 border border-gray-700 rounded px-2 py-1.5 pr-7 text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer w-full text-sm"
                  >
                    <option value="">Select a common header</option>
                    {COMMON_HEADERS.map((header) => (
                      <option key={`${header.name}-${header.value}`} value={`${header.name}: ${header.value}`}>
                        {header.name}: {header.value}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addHeader}
                  disabled={!selectedHeader}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-8 h-8"
                >
                  <AddIcon className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={tab.headers}
                onChange={(e) => updateTab(tab.id, { headers: e.target.value })}
                placeholder="Enter headers (one per line, format: Key: Value)"
                className="input-field w-full flex-1 resize-none text-xs"
              />
            </div>
          ) : (
            <textarea
              value={tab.body}
              onChange={(e) => updateTab(tab.id, { body: e.target.value })}
              placeholder="Enter request body (JSON)"
              className="input-field w-full h-full resize-none text-xs"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col border-t border-gray-700" style={{ height: "70%" }}>
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium">Response</h2>
            {responseStatus && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                responseStatus >= 200 && responseStatus < 300 ? 'bg-green-500/20 text-green-400' :
                responseStatus >= 300 && responseStatus < 400 ? 'bg-blue-500/20 text-blue-400' :
                responseStatus >= 400 && responseStatus < 500 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {responseStatus}
              </span>
            )}
            {responseTime !== null && (
              <span className="text-xs text-gray-400">
                {responseTime}ms
              </span>
            )}
          </div>
          {tab.response && (
            <button
              onClick={clearResponse}
              className="clear-response-btn p-1 rounded-full hover:bg-gray-700"
              title="Clear response"
            >
              <ClearIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Response Headers</h3>
            <div className="space-y-0.5">
              {responseHeaders ? (
                Object.entries(responseHeaders).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-400">{key}:</span>{' '}
                    <span className="text-gray-300">{value}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No headers available</div>
              )}
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Response Body</h3>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {tab.response || 'No response yet'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestPage = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabs();

  const handleAddTab = () => {
    addTab();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-gray-700">
        <div className="flex-1 flex overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center px-3 py-1.5 border-r border-gray-700 cursor-pointer ${
                activeTabId === tab.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-xs">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="flex items-center px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800/50 border-l border-gray-700"
          >
            <AddIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${
              activeTabId === tab.id ? 'block' : 'hidden'
            }`}
          >
            <RequestTab tab={tab} onClose={() => closeTab(tab.id)} />
          </div>
        ))}
      </div>
    </div>
  );
};

const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export default RequestPage;