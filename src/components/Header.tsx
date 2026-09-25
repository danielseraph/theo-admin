import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Header({ setSidebarOpen }: { setSidebarOpen: (val: boolean) => void }) {
  const location = useLocation();
  const path = location.pathname;
  let title = "Dashboard Overview";
  if (path.includes('registrations')) title = "Community Registrations";
  else if (path.includes('events')) title = "Events Management";
  else if (path.includes('posts')) title = "News & Posts";
  else if (path.includes('leadership')) title = "Leadership Team";
  else if (path.includes('gallery')) title = "Gallery Management";
  else if (path.includes('messages')) title = "Contact Messages";

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <button 
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <div className="text-xs text-gray-500 hidden sm:block">Working Together. Growing Together. Winning Together.</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-slate-800">Admin User</div>
          <div className="text-xs text-gray-500">Superadmin</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent font-bold">
          A
        </div>
      </div>
    </header>
  );
}