import clsx from "clsx";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "split" | "center";
  actions?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "split",
  actions,
  className,
}: SectionHeadingProps) {
  const descriptionNode = typeof description === "string" ? <p className="copy">{description}</p> : description;

  return (
    <div
      className={clsx(
        "section-heading",
        align === "split" && "section-heading--split",
        align === "center" && "section-heading--center",
        className,
      )}
    >
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {typeof title === "string" ? <h2 className="section-title">{title}</h2> : title}
      </div>
      {descriptionNode ? <div className="section-heading__body">{descriptionNode}</div> : null}
      {actions ?? null}
    </div>
  );
}
