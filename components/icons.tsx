type IconName = "arrow" | "calendar" | "chevron" | "clock" | "close" | "facebook" | "instagram" | "menu" | "pin" | "search" | "trophy" | "user" | "youtube" | "mail" | "phone" | "external";

export function Icon({ name, size = 20, strokeWidth = 1.7 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 9h18" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    facebook: <path d="M14 8h3V5h-3c-2.8 0-4.5 1.8-4.5 4.7V12H7v3h2.5v6h3v-6H16l.5-3h-4V9.9c0-1.2.5-1.9 1.5-1.9Z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" stroke="none" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    youtube: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    phone: <path d="M6.5 3.5 9 4l1.5 4-2 1.5a15 15 0 0 0 6 6L16 13l4 1.5.5 2.5c.2 1.3-.9 2.5-2.2 2.5C10.4 19.5 4.5 13.6 4.5 5.7c0-1.3.7-2.4 2-2.2Z" />,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}
