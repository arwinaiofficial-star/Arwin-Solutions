interface TimelineItem {
  year: string;
  label: string;
  detail: string;
  milestone?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {items.map((item, index) => (
        <div 
          key={index} 
          className={`relative pl-8 ${item.milestone ? 'border-l-2 border-primary-500' : 'border-l border-border-light'}`}
          style={{ borderColor: item.milestone ? 'var(--primary-500)' : 'var(--border-light)' }}
        >
          <div 
            className="absolute -left-1.5 top-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: item.milestone ? 'var(--primary-500)' : 'var(--gray-300)' }}
          />
          <div className="mb-2">
            <span 
              className="text-sm font-semibold"
              style={{ color: item.milestone ? 'var(--primary-600)' : 'var(--text-tertiary)' }}
            >
              {item.year}
            </span>
            <h3 className="font-semibold mt-1">
              {item.label}
            </h3>
          </div>
          <p className="text-secondary text-sm leading-relaxed">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}