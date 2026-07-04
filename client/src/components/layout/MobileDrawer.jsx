import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { HiX, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_MENU } from '../../utils/constants';
import logo from '../../assets/logo.svg';

export default function MobileDrawer({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-elevated"
          >
            <div className="flex items-center justify-between p-4 h-16 border-b border-cafe-bg-secondary">
              <img src={logo} alt="CafeFlow" className="h-9" />
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-cafe-bg-secondary transition-colors">
                <HiX className="w-5 h-5 text-cafe-text-muted" />
              </button>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
              {SIDEBAR_MENU.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-cafe-accent text-white shadow-soft'
                      : 'text-cafe-text-light hover:bg-cafe-bg-secondary hover:text-cafe-text'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t border-cafe-bg-secondary">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-cafe-text-light hover:bg-red-50 hover:text-danger transition-all duration-200 w-full"
              >
                <HiOutlineLogout className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
