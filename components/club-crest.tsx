import Image from "next/image";

export function ClubCrest({ size = "md", className = "", src = "/images/logo-dcb.jpeg" }: { size?: "sm" | "md" | "lg"; className?: string; src?: string }) {
  const sizes = { sm: 36, md: 54, lg: 92 };
  const px = sizes[size];
  return <Image src={src} width={px} height={px} alt="Écusson du DC Boghni" className={`object-cover ${className}`} priority={size === "lg"} />;
}
