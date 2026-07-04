export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-cafe-text-light">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-cafe-text-muted" />
          </div>
        )}
        <input
          className={`
            w-full bg-cafe-bg border border-cafe-bg-secondary rounded-xl
            px-4 py-2.5 text-sm text-cafe-text placeholder:text-cafe-text-muted
            focus:outline-none focus:ring-2 focus:ring-cafe-accent/30 focus:border-cafe-accent
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger ring-1 ring-danger/30' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function TextArea({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-cafe-text-light">{label}</label>}
      <textarea
        className={`
          w-full bg-cafe-bg border border-cafe-bg-secondary rounded-xl
          px-4 py-2.5 text-sm text-cafe-text placeholder:text-cafe-text-muted
          focus:outline-none focus:ring-2 focus:ring-cafe-accent/30 focus:border-cafe-accent
          transition-all duration-200 resize-none
          ${error ? 'border-danger ring-1 ring-danger/30' : ''}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
