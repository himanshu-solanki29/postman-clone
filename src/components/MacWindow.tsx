import React, { useState, useRef, useEffect, useCallback } from 'react';

// Define a custom event for fullscreen toggle
// This will be used to communicate with the MenuBar component
const WINDOW_FULLSCREEN_EVENT = 'mac-window-fullscreen';

interface MacWindowProps {
  children: React.ReactNode;
}

const MacWindow: React.FC<MacWindowProps> = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startMousePosition, setStartMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Emit custom event when fullscreen state changes
  useEffect(() => {
    const event = new CustomEvent(WINDOW_FULLSCREEN_EVENT, { 
      detail: { isFullscreen } 
    });
    window.dispatchEvent(event);
  }, [isFullscreen]);
  
  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFullscreen(prev => !prev);
    
    // Reset position when toggling fullscreen
    if (!isFullscreen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);
  
  const toggleMenu = useCallback(() => {
    setIsMenuVisible(prev => !prev);
  }, []);
  
  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    
    // Only allow dragging from the title bar, not from buttons
    if ((e.target as HTMLElement).closest('.mac-traffic-light')) return;
    
    setIsDragging(true);
    setStartPosition({ x: position.x, y: position.y });
    setStartMousePosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Use relative movement from the starting point
    const deltaX = e.clientX - startMousePosition.x;
    const deltaY = e.clientY - startMousePosition.y;
    
    setPosition({
      x: startPosition.x + deltaX,
      y: startPosition.y + deltaY
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPosition, startMousePosition]);

  // Track mouse position for showing menu toggle in fullscreen
  const [isMouseNearTop, setIsMouseNearTop] = useState(false);
  
  useEffect(() => {
    if (!isFullscreen) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setIsMouseNearTop(e.clientY < 10);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFullscreen]);

  return (
    <div className={`w-full h-full flex items-center justify-center 
      ${isFullscreen ? 'fixed inset-0 z-40 p-0 bg-gray-950' : 'p-4'}`}>
      {/* Menu toggle button in fullscreen mode */}
      {isFullscreen && isMouseNearTop && !isMenuVisible && (
        <div 
          className={`fullscreen-toggle-btn ${isMouseNearTop ? 'visible' : ''}`}
          onClick={toggleMenu}
        >
          Show Menu
        </div>
      )}
      
      <div 
        ref={windowRef}
        style={!isFullscreen ? {
          transform: `translate(${position.x}px, ${position.y}px)`
        } : {}}
        className={`${isFullscreen ? 'w-full h-full max-w-none rounded-none' : 'w-full max-w-5xl h-[80vh]'} 
          bg-gray-800/80 backdrop-blur-xl overflow-hidden flex flex-col border border-gray-700/50 mac-window
          transition-all duration-300 ease-in-out ${isDragging ? 'dragging' : ''}`}
      >
        {/* Window Title Bar */}
        <div 
          className={`mac-title-bar ${!isFullscreen ? 'can-drag' : ''} ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-1.5">
            <div className="mac-traffic-light rounded-full bg-[#FF5F57]"></div>
            <div className="mac-traffic-light rounded-full bg-[#FFBD2E]"></div>
            <div 
              className="mac-traffic-light rounded-full bg-[#28C840] cursor-pointer"
              onClick={toggleFullscreen}
            ></div>
          </div>
          <div className="flex-1 text-center text-gray-300/90 text-xs font-medium select-none">
            {isFullscreen ? 'AI-Powered Postman (Fullscreen)' : 'Postman Clone'}
          </div>
          
          {/* Fullscreen control icons */}
          {isFullscreen && (
            <div className="flex items-center space-x-2 mr-2">
              {isMenuVisible && (
                <div 
                  className="text-gray-400 hover:text-white cursor-pointer" 
                  onClick={toggleMenu}
                  title="Hide menu bar"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              )}
              <div 
                className="text-gray-400 hover:text-white cursor-pointer" 
                onClick={toggleFullscreen}
                title="Exit fullscreen"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0l-5 5" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Window Content */}
        <div className="window-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Export the event name for other components to listen to
export { WINDOW_FULLSCREEN_EVENT };
export default MacWindow; 