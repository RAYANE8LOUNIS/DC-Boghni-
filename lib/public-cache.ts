import { revalidateTag } from "next/cache";

/** Invalidate the short-lived public cache after an administrative change. */
export function revalidatePublicSite() {
  revalidateTag("public-site");
  revalidateTag("club-settings");
}
