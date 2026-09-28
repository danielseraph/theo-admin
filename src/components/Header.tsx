import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Dashboard Overview';
  if (path.startsWith('/registrations')) title = 'Community Registrations';
  else if (path.startsWith('/events')) title = 'Events Management';
  else if (path.startsWith('/posts')) title = 'News & Posts';
  else if (path.startsWith('/leadership')) title = 'Leadership Team';
  else if (path.startsWith('/gallery')) title = 'Gallery Management';
  else if (path.startsWith('/messages')) title = 'Contact Messages';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 flex-shrink-0 w-full">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="md:hidden p-2 -ml-1 text-slate-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate leading-tight">
            {title}
          </h2>
          <p className="text-[11px] text-gray-400 hidden sm:block truncate">
            Working Together. Growing Together. Winning Together.
          </p>
        </div>
      </div>

      {/* Right: Admin Profile Avatar */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
            Administrator
          </div>
          <div className="text-[11px] text-gray-400">Superadmin</div>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-accent font-bold text-sm shadow-sm ring-2 ring-primary/10">
          A
        </div>
      </div>
    </header>
  );
}