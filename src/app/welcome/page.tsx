import { redirect } from "next/navigation";

// /welcome was a 3-slide carousel intro; the same story now lives on the
// home one-pager (hero + how-it-works). Redirect to root.
export default function WelcomeRedirect(): never {
  redirect("/");
}
