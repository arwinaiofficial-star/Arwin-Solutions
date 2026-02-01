import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

type SectionTone = "default" | "muted" | "inset" | "brand";

type SectionShellProps = PropsWithChildren<{
  tone?: SectionTone;
  padding?: "tight" | "base" | "wide";
  bleed?: "none" | "wide";
  className?: string;
  header?: ReactNode;
  id?: string;
}>;

export function SectionShell({
  children,
  tone = "default",
  padding = "base",
  bleed = "none",
  className,
  header,
  id,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={clsx("section-shell", className)}
      data-tone={tone === "default" ? undefined : tone}
      data-padding={padding === "base" ? undefined : padding}
      data-bleed={bleed === "none" ? undefined : bleed}
    >
      <div className={clsx(bleed === "wide" ? "shell-wide" : "shell")}>
        {header && <div className="section-shell__header">{header}</div>}
        {children}
      </div>
    </section>
  );
}
