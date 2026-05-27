import type { ReactNode } from "react";

interface Props {
  title: string;
  meta?: ReactNode;
}

export function SectionHeader({ title, meta }: Props) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {meta && <span>{meta}</span>}
    </div>
  );
}
