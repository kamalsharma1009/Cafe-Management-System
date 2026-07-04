import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative bg-white rounded-2xl shadow-elevated w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
          >
            <div className="flex items-center justify-between p-6 border-b border-cafe-bg-secondary">
              <h2 className="text-lg font-semibold text-cafe-text font-display">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-cafe-bg-secondary transition-colors text-cafe-text-muted hover:text-cafe-text"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
