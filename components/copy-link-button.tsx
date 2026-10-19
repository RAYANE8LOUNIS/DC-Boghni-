"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" className="button button--outline" onClick={copy}><Icon name="arrow" size={15} />{copied ? "Lien copié" : "Copier le lien"}</button>;
}
