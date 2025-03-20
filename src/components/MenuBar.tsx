import React from 'react';
import { WINDOW_FULLSCREEN_EVENT } from './MacWindow';

interface MenuBarProps {}

const MenuBar: React.FC<MenuBarProps> = () => {
  // Get current time and date
  const [time, setTime] = React.useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [date, setDate] = React.useState<string>(
    new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  );
  
  // State to track fullscreen mode
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  
  // State to force show menu bar even in fullscreen
  const [showMenuInFullscreen, setShowMenuInFullscreen] = React.useState<boolean>(false);
  
  // State to track if mouse is near the top of the screen
  const [isMouseNearTop, setIsMouseNearTop] = React.useState<boolean>(false);
  
  // Update the clock and date every minute
  React.useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }));
    };
    
    // Run once immediately to avoid waiting for the first interval
    updateDateTime();
    
    const timer = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Listen for custom fullscreen events from MacWindow
  React.useEffect(() => {
    const handleWindowFullscreenChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsFullscreen(detail.isFullscreen);
      // When entering fullscreen, reset menu visibility state
      if (detail.isFullscreen) {
        setShowMenuInFullscreen(false);
      }
    };
    
    window.addEventListener(WINDOW_FULLSCREEN_EVENT, handleWindowFullscreenChange);
    
    return () => {
      window.removeEventListener(WINDOW_FULLSCREEN_EVENT, handleWindowFullscreenChange);
    };
  }, []);

  // Detect native fullscreen changes (browser fullscreen)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = !!document.fullscreenElement;
      setIsFullscreen(fullscreenActive);
      
      // Reset menu visibility when exiting fullscreen
      if (!fullscreenActive) {
        setShowMenuInFullscreen(false);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Track mouse position to detect when near top of screen
  React.useEffect(() => {
    if (!isFullscreen) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Consider mouse near top if within 10px of the top edge
      setIsMouseNearTop(e.clientY < 10);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFullscreen]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Toggle menu visibility in fullscreen mode
  const toggleMenuInFullscreen = () => {
    setShowMenuInFullscreen(prev => !prev);
  };

  // If in fullscreen mode and menu is not forced to show
  if (isFullscreen && !showMenuInFullscreen) {
    // Show a small button when mouse hovers near top
    return isMouseNearTop ? (
      <div 
        className={`fullscreen-toggle-btn ${isMouseNearTop ? 'visible' : ''}`}
        onClick={toggleMenuInFullscreen}
      >
        Show Menu
      </div>
    ) : null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-black/80 mac-menu-bar flex items-center justify-between px-4 text-white">
      <div className="flex items-center">
        <div className="mac-menu-item flex items-center px-2">
          <svg className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M17.6 4.1c1.4 0 2.9 0.8 3.8 2.1-3.3 1.9-2.8 6.9 0.7 8.3 0.9 0.4 1.8 0.4 2.7 0.2-0.2 0.7-0.5 1.4-0.9 2-0.7 1-1.5 1.8-2.6 2.5-1.1 0.6-2.3 0.9-3.6 0.9-1.5 0-2.8-0.5-3.9-1.3-0.6-0.4-1.2-0.9-1.7-1.5s-0.9-1.1-1.3-1.7c-0.8-1.3-1.2-2.7-1.2-4.2 0-1.5 0.4-2.9 1.2-4.2 1.2-2 3.1-3.1 5.1-3.1h0.7z" />
          </svg>
        </div>
        <div className="mac-menu-item text-xs font-bold">Postman</div>
        <div className="mac-menu-item text-xs">File</div>
        <div className="mac-menu-item text-xs">Edit</div>
        <div className="mac-menu-item text-xs">View</div>
        <div className="mac-menu-item text-xs">Window</div>
        <div className="mac-menu-item text-xs">Help</div>
      </div>
      
      <div className="flex items-center mac-status-icons">
        {isFullscreen && (
          <div 
            className="mac-menu-item text-xs flex items-center gap-1 cursor-pointer" 
            onClick={toggleMenuInFullscreen}
            title="Hide menu bar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        )}
        <div className="mac-menu-item text-xs flex items-center gap-1 cursor-pointer" onClick={toggleFullscreen}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </div>
        <div className="mac-menu-item text-xs flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        </div>
        <div className="mac-menu-item text-xs flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div className="mac-menu-item text-xs flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="mac-menu-item text-xs">{date}</div>
        <div className="mac-menu-item text-xs">{time}</div>
        <div className="mac-menu-item text-xs flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MenuBar; 