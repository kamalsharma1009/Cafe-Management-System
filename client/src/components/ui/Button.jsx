import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-cafe-accent hover:bg-cafe-accent-hover text-white shadow-soft',
  secondary: 'bg-cafe-bg-secondary hover:bg-cafe-card text-cafe-text',
  danger: 'bg-danger hover:bg-red-600 text-white',
  success: 'bg-success hover:bg-green-600 text-white',
  outline: 'border-2 border-cafe-accent text-cafe-accent hover:bg-cafe-accent hover:text-white',
  ghost: 'text-cafe-text-light hover:bg-cafe-bg-secondary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        btn-ripple inline-flex items-center justify-center gap-2 font-medium
        rounded-xl transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
