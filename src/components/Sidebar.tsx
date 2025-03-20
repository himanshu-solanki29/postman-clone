import { useNavigate, useLocation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';

const menuItems = [
  { text: 'Requests', icon: <SendIcon />, path: '/' },
  { text: 'History', icon: <HistoryIcon />, path: '/history' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 h-full bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-orange-500">Postman Clone</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4">
          <p className="uppercase text-xs font-bold text-gray-500 mb-2">Workspace</p>
          {menuItems.map((item) => (
            <button
              key={item.text}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm rounded-md transition-colors duration-200 mb-1 ${
                location.pathname === item.path
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 