export default function Table({ headers, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cafe-bg border-b border-cafe-bg-secondary">
              {headers.map((header, i) => (
                <th key={i} className="text-left px-5 py-3.5 text-xs font-semibold text-cafe-text-muted uppercase tracking-wider whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cafe-bg-secondary/50">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      className={`hover:bg-cafe-bg/50 transition-colors duration-150 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-5 py-3.5 text-cafe-text whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}
