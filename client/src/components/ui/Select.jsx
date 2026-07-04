export default function Select({ label, error, options = [], placeholder, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-cafe-text-light">{label}</label>}
      <select
        className={`
          w-full bg-cafe-bg border border-cafe-bg-secondary rounded-xl
          px-4 py-2.5 text-sm text-cafe-text
          focus:outline-none focus:ring-2 focus:ring-cafe-accent/30 focus:border-cafe-accent
          transition-all duration-200 cursor-pointer appearance-none
          ${error ? 'border-danger ring-1 ring-danger/30' : ''}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
