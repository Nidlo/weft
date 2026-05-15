import { redirect } from "next/navigation";

// /wallet was renamed to /earnings - Nidlo doesn't operate a wallet
// (payments flow client → designer instantly via Moolre/Paystack).
// Bookmarks and SMS deep-links keep working via this redirect.
export default function WalletRedirect() {
  redirect("/earnings");
}
