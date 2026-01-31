interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon?: string;
  className?: string;
}

export default function StatCard({ 
  label, 
  value, 
  helper, 
  icon,
  className = '' 
}: StatCardProps) {
  return (
    <div className={`stat group hover:border-blue-200 transition-all duration-300 ${className}`}>
      {icon && (
        <div className="stat-icon text-blue-600 group-hover:text-blue-700 transition-colors">
          {icon}
        </div>
      )}
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {helper && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{helper}</p>
      )}
    </div>
  );
}