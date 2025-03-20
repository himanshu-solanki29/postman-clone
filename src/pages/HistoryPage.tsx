import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { useHistory } from '../context/HistoryContext';
import { useTabs } from '../context/TabContext';
import { HistoryItem } from '../types/history';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400';
  if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-400';
  if (status >= 400 && status < 500) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
};

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-blue-500/20 text-blue-400';
    case 'POST':
      return 'bg-green-500/20 text-green-400';
    case 'PUT':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'DELETE':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const HistoryPage = () => {
  const { history, deleteHistoryItem } = useHistory();
  const { createTabFromHistory } = useTabs();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const navigate = useNavigate();

  const handleUseRequest = (item: HistoryItem) => {
    createTabFromHistory(item);
    navigate('/'); // Navigate to the request page
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h1 className="text-base font-medium">Request History</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-700 overflow-auto">
          {history.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <p className="text-sm">No history yet</p>
              <p className="text-xs mt-1">Your request history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`card p-3 cursor-pointer hover:bg-gray-700/50 ${
                    selectedItem?.id === item.id ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.url}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getMethodColor(item.method)}`}>
                          {item.method}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(item.timestamp)}
                        </span>
                        {item.time && (
                          <span className="text-xs text-gray-400">
                            {item.time}ms
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseRequest(item);
                        }}
                        className="text-gray-400 hover:text-orange-500 ml-1 p-1"
                        title="Use this request"
                      >
                        <RestoreIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 ml-1 p-1"
                        title="Delete from history"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-1/2 p-3 overflow-auto">
          {selectedItem ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h2 className="text-sm font-medium">Request Details</h2>
                <button
                  onClick={() => handleUseRequest(selectedItem)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  <RestoreIcon className="w-3 h-3" />
                  <span>Use Request</span>
                </button>
              </div>
              <div className="card p-3">
                <p className="text-xs font-medium mb-1">URL: <span className="font-normal">{selectedItem.url}</span></p>
                <p className="text-xs font-medium mb-1">Method: <span className="font-normal">{selectedItem.method}</span></p>
                <p className="text-xs font-medium mb-1">Status: <span className="font-normal">{selectedItem.status}</span></p>
                <p className="text-xs font-medium mb-1">Time: <span className="font-normal">{formatTimestamp(selectedItem.timestamp)}</span></p>
                {selectedItem.time && (
                  <p className="text-xs font-medium mb-1">Response Time: <span className="font-normal">{selectedItem.time}ms</span></p>
                )}
              </div>

              {selectedItem.headers && (
                <div>
                  <h2 className="text-sm font-medium mb-1">Headers</h2>
                  <div className="card p-3 space-y-0.5">
                    {Object.entries(selectedItem.headers).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-400">{key}:</span>{' '}
                        <span className="text-gray-300">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-sm font-medium mb-1">Response</h2>
                <pre className="card p-3 text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
                  {selectedItem.response}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage; 