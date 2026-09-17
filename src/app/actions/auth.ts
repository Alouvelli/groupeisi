"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import type { ActionResult } from "./newsletter";

export async function loginAction(input: { email: string; password: string; next?: string }): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Email ou mot de passe invalide.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const res = await login(parsed.data.email, parsed.data.password);
  if (!res.ok) return { ok: false, message: res.error };
  return { ok: true, message: `Bienvenue ${res.user.nom}` };
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}
