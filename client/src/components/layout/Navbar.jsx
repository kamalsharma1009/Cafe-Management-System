import { useState, useEffect } from 'react';
import { HiOutlineMenuAlt2, HiOutlineBell, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks/useSettings';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-cafe-bg-secondary flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-cafe-bg-secondary transition-colors"
        >
          <HiOutlineMenuAlt2 className="w-5 h-5 text-cafe-text" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-cafe-text font-display">
            {settings?.cafeName || 'CafeFlow'}
          </p>
          <p className="text-xs text-cafe-text-muted tabular-nums">
            {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-cafe-bg-secondary transition-colors relative">
          <HiOutlineBell className="w-5 h-5 text-cafe-text-light" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cafe-accent rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-2 ml-2 border-l border-cafe-bg-secondary">
          <div className="w-8 h-8 bg-cafe-accent rounded-full flex items-center justify-center">
            <HiOutlineUser className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-cafe-text">{user?.name || 'Manager'}</p>
            <p className="text-xs text-cafe-text-muted">{user?.role || 'MANAGER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
