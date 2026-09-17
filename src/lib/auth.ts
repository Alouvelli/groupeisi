/**
 * Authentification admin : mots de passe bcrypt + session signée (HMAC) en cookie.
 * Le jeton est vérifiable côté Edge (middleware) via Web Crypto.
 */
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { env } from "./env";
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./session-token";

export { SESSION_COOKIE };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.isActive) return { ok: false as const, error: "Identifiants invalides." };
  const valid = await verifyPassword(password, user.password);
  if (!valid) return { ok: false as const, error: "Identifiants invalides." };

  const token = await createSessionToken({ uid: user.id, role: user.role }, env.authSecret);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ok: true as const, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } };
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export interface SessionUser {
  id: string;
  nom: string;
  email: string;
  role: Role;
  avatar: string | null;
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token, env.authSecret);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, nom: true, email: true, role: true, avatar: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { id: user.id, nom: user.nom, email: user.email, role: user.role, avatar: user.avatar };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/admin?forbidden=1");
  return user;
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  EDITEUR: "Éditeur",
};
