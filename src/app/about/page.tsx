import { redirect } from "next/navigation";

// /about and /welcome and /contact were folded into the home one-pager.
// Keep these as redirects so external bookmarks and stale cached links
// don't 404.
export default function AboutRedirect(): never {
  redirect("/#about");
}
