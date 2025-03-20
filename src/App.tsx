import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RequestPage from './pages/RequestPage';
import HistoryPage from './pages/HistoryPage';
import { TabProvider } from './context/TabContext';
import { HistoryProvider } from './context/HistoryContext';
import MacWindow from './components/MacWindow';
import MenuBar from './components/MenuBar';

/**
 * Main App component - Final Version
 * 
 * Features:
 * - macOS-style interface with menu bar and window
 * - Responsive layout with sidebar navigation
 * - Tab management for multiple requests
 * - Request history tracking
 * - Full-screen mode with menu toggle
 */
function App() {
  return (
    <div className="h-screen w-screen overflow-hidden macos-sonoma flex items-center justify-center">
      <MenuBar />
      <TabProvider>
        <HistoryProvider>
          <Router>
            <MacWindow>
              <div className="flex h-full">
                <Sidebar />
                <div className="flex-1 overflow-hidden">
                  <Routes>
                    <Route path="/" element={<RequestPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                  </Routes>
                </div>
              </div>
            </MacWindow>
          </Router>
        </HistoryProvider>
      </TabProvider>
    </div>
  );
}

export default App;
