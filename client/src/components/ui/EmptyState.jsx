import { motion } from 'framer-motion';
import { HiOutlineInbox } from 'react-icons/hi';

export default function EmptyState({ title = 'No data found', description = 'There are no items to display.', icon: Icon = HiOutlineInbox, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 bg-cafe-bg-secondary rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-cafe-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-cafe-text mb-1 font-display">{title}</h3>
      <p className="text-sm text-cafe-text-muted text-center max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
