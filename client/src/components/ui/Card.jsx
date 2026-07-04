import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2, boxShadow: '0 10px 40px -10px rgba(58, 49, 44, 0.15)' } : {}}
      className={`bg-white rounded-2xl shadow-soft p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, color = 'bg-cafe-accent' }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-cafe-text-muted truncate">{title}</p>
        <p className="text-xl font-bold text-cafe-text font-display tabular-nums">{value}</p>
        {trend && <p className="text-xs text-cafe-text-muted mt-0.5">{trend}</p>}
      </div>
    </Card>
  );
}
