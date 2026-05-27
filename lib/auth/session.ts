import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const isMockMode = process.env.MOCK_MODE !== "false";

export async function getSession() {
  if (isMockMode || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionRole(): Promise<UserRole | null> {
  const user = await getSession();
  if (!user) return null;
  return (user.user_metadata?.role as UserRole) ?? "viewer";
}

export async function requireAuth() {
  if (isMockMode || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(minimumRole: UserRole) {
  const user = await requireAuth();
  if (!user) return null;

  const roleHierarchy: UserRole[] = ["viewer", "reviewer", "editor", "admin"];
  const userRole = (user.user_metadata?.role as UserRole) ?? "viewer";
  const userLevel = roleHierarchy.indexOf(userRole);
  const requiredLevel = roleHierarchy.indexOf(minimumRole);

  if (userLevel < requiredLevel) {
    redirect("/dashboard");
  }

  return user;
}
