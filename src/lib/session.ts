import { cookies } from "next/headers";
import { getProfileById, listProfiles } from "@/lib/data/store";
import type { Profile } from "@/lib/data/types";

const COOKIE_NAME = "3x3_user";

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<Profile | null> {
  const id = await getCurrentUserId();
  if (!id) return null;
  return getProfileById(id) ?? null;
}

export async function setCurrentUser(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCurrentUser() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not logged in");
  }
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Not authorized");
  return user;
}

export function listDemoLoginOptions() {
  return listProfiles().map((p) => ({
    id: p.id,
    name: p.displayName,
    role: p.role,
    avatarColor: p.avatarColor,
  }));
}
