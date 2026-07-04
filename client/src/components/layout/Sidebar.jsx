import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLogout, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_MENU } from '../../utils/constants';
import logo from '../../assets/logo.svg';

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col h-screen bg-white border-r border-cafe-bg-secondary fixed left-0 top-0 z-30"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-cafe-bg-secondary">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.img
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={logo}
              alt="CafeFlow"
              className="h-9"
            />
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-cafe-bg-secondary transition-colors text-cafe-text-muted flex-shrink-0"
        >
          {collapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {SIDEBAR_MENU.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-cafe-accent text-white shadow-soft'
                : 'text-cafe-text-light hover:bg-cafe-bg-secondary hover:text-cafe-text'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  key={item.name}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-cafe-bg-secondary">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cafe-text-light hover:bg-red-50 hover:text-danger transition-all duration-200 w-full"
        >
          <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
