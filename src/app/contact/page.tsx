import { redirect } from "next/navigation";

export default function ContactRedirect(): never {
  redirect("/#contact");
}
