import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Calendar, FileText, UserCheck, 
  Image, Mail, LogOut, X, Sparkles 
} from 'lucide-react';
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

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      <aside
        className={clsx(
          // Base mobile drawer (fixed overlay)
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-primary text-white h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out',
          // Desktop sidebar (sticky in normal flow)
          'md:static md:translate-x-0 md:w-64 md:h-screen md:sticky md:top-0 md:shadow-lg md:z-20 md:flex-shrink-0',
          // Visibility toggles
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full pointer-events-none md:pointer-events-auto'
        )}
      >
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Dr <span className="text-accent">Theos</span>
              </h1>
              <p className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white/15 text-accent font-semibold shadow-inner border border-white/10'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon
                  className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-accent' : 'text-blue-200'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom Section */}
        <div className="p-4 border-t border-white/10 bg-primary/40">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex items-center space-x-3 px-3.5 py-2.5 w-full text-left rounded-xl hover:bg-red-500/20 text-red-200 hover:text-red-100 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-red-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}