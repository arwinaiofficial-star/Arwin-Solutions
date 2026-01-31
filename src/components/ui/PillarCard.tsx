import Link from 'next/link';

interface PillarCardProps {
  title: string;
  description: string;
  status: string;
  phase: string;
  accent: string;
  url: string;
  icon?: string;
  className?: string;
}

export default function PillarCard({ 
  title, 
  description, 
  status, 
  phase, 
  accent, 
  url, 
  icon,
  className = '' 
}: PillarCardProps) {
  const iconColor = getIconColor(title);
  
  return (
    <article className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="tag tag-primary">{phase}</span>
        <span className="text-sm text-secondary">{status}</span>
      </div>
      
      <div className="mb-4">
        {icon && (
          <div className={`icon-box mb-3 ${iconColor}`}>{icon}</div>
        )}
        <h3 className="text-xl font-semibold mb-2">
          {title}
        </h3>
        <p className="text-sm text-tertiary mb-3">{accent}</p>
      </div>
      
      <p className="text-secondary text-sm mb-6 leading-relaxed">{description}</p>
      
      <Link 
        href={url}
        className="btn btn-primary btn-sm"
      >
        Learn more →
      </Link>
    </article>
  );
}

function getIconColor(title: string): string {
  if (title === 'WTAI') return 'icon-box-blue';
  if (title === 'Maya Design System') return 'icon-box-teal';
  if (title === 'JobReady.ai') return 'icon-box-gray';
  return 'icon-box-blue';
}