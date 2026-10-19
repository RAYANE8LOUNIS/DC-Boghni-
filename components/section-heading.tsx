import Link from "next/link";
import { Icon } from "@/components/icons";

export function SectionHeading({ eyebrow, title, text, href, linkLabel = "Tout voir", light = false }: { eyebrow: string; title: string; text?: string; href?: string; linkLabel?: string; light?: boolean }) {
  return <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-heading__text">{text}</p>}</div>
    {href && <Link className="text-link" href={href}>{linkLabel}<Icon name="arrow" size={17} /></Link>}
  </div>;
}
