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
    <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-6">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs sm:text-sm text-cafe-text-muted sm:truncate font-medium">{title}</p>
        <p className="text-lg sm:text-xl font-bold text-cafe-text font-display tabular-nums mt-0.5 sm:mt-0">{value}</p>
        {trend && <p className="text-xs text-cafe-text-muted mt-0.5">{trend}</p>}
      </div>
    </Card>
  );
}
