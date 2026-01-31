import Link from 'next/link';

interface ProjectCardProps {
  name: string;
  tagline: string;
  description: string;
  url: string;
  focus: string[];
  outcome: string;
  className?: string;
}

export default function ProjectCard({ 
  name, 
  tagline, 
  description, 
  url, 
  focus, 
  outcome,
  className = '' 
}: ProjectCardProps) {
  return (
    <article className={`card ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-tertiary mb-1">
            {tagline}
          </p>
          <h3 className="text-lg font-semibold">
            {name}
          </h3>
        </div>
        <Link 
          href={url} 
          className="tag tag-primary flex-shrink-0"
          target="_blank" 
          rel="noreferrer"
        >
          Visit ↗
        </Link>
      </div>
      
      <p className="text-secondary text-sm mb-4 leading-relaxed">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {focus.map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>
      
      <p className="text-sm text-tertiary border-t pt-4">
        {outcome}
      </p>
    </article>
  );
}