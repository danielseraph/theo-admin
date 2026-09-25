import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, UserCheck, Image, Mail, LogOut, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Registrations', path: '/registrations', icon: Users },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'News & Posts', path: '/posts', icon: FileText },
  { name: 'Leadership', path: '/leadership', icon: UserCheck },
  { name: 'Gallery', path: '/gallery', icon: Image },
  { name: 'Messages', path: '/messages', icon: Mail },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className={clsx(
      "w-64 bg-primary text-white h-screen sticky top-0 flex flex-col shadow-xl z-30 transition-transform duration-300 md:translate-x-0 fixed md:sticky",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-accent mb-1">Dr Theos</h1>
          <p className="text-xs text-blue-200">Admin Dashboard</p>
        </div>
        <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-white/10 text-accent' : 'hover:bg-white/5'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg hover:bg-white/5 transition-colors text-red-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}