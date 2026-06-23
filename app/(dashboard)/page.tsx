import { redirect } from "next/navigation";

// /dashboard redirects to /dashboard/dashboard
export default function DashboardRootPage() {
  redirect("/dashboard/dashboard");
}
