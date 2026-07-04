import { motion } from 'framer-motion';

export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={`${sizes[size]} border-3 border-cafe-bg-secondary border-t-cafe-accent rounded-full`}
      style={{ borderWidth: '3px' }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-cafe-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
