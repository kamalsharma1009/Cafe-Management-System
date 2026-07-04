import { HiOutlineSearch } from 'react-icons/hi';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-cafe-bg-secondary rounded-xl text-sm text-cafe-text placeholder:text-cafe-text-muted focus:outline-none focus:ring-2 focus:ring-cafe-accent/30 focus:border-cafe-accent transition-all duration-200"
      />
    </div>
  );
}
