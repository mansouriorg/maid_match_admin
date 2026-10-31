import { redirect } from "next/navigation";

// There is no separate list of requests: the dashboard shows all of them.
// This page only exists so that the link /requests does not lead to an error.
export default function RequestsPage() {
  redirect("/dashboard");
}
